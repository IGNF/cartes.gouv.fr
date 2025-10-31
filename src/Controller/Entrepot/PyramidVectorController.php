<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\PyramidVector\PyramidVectorCompositionDTO;
use App\Dto\Services\PyramidVector\PyramidVectorGenerateDTO;
use App\Dto\Services\PyramidVector\PyramidVectorTmsServiceDTO;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\SandboxService;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/pyramid-vector',
    name: 'cartesgouvfr_api_pyramid_vector_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[cartes.gouv.fr] pyramid-vector', description: 'Génération de pyramides de tuiles vectorielles et création/modification des services associés')]
class PyramidVectorController extends ServiceController implements ApiControllerInterface
{
    public function __construct(
        DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private StoredDataApiService $storedDataApiService,
        private ProcessingApiService $processingApiService,
        SandboxService $sandboxService,
        private CartesServiceApiService $cartesServiceApiService,
        CapabilitiesService $capabilitiesService,
        CartesMetadataApiService $cartesMetadataApiService,
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApiService, $capabilitiesService, $cartesMetadataApiService, $sandboxService);
    }

    #[Route('/add', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, #[MapRequestPayload] PyramidVectorGenerateDTO $dto): JsonResponse
    {
        try {
            // TODO
            // $samplePyramidId = $request->query->get('samplePyramidId', null);

            $vectordb = $this->storedDataApiService->get($datastoreId, $dto->vectordb_id);

            // TODO Suppression de l'upload ?

            // On met les valeurs de bottom_level et top_level sous forme de chaine
            $composition = [];
            foreach ($dto->composition as $compo) {
                $composition[] = [
                    'table' => $compo->table,
                    'attributes' => $compo->attributes,
                    'bottom_level' => strval($compo->bottom_level),
                    'top_level' => strval($compo->top_level),
                ];
            }

            $levels = $this->getLevels($dto->composition);

            $parameters = [
                'composition' => $composition,
                'bottom_level' => strval(end($levels)),
                'top_level' => strval($levels[0]),
                'tippecanoe_options' => $dto->tippecanoe,
            ];

            if (!is_null($dto->area)) {
                $parameters['area'] = $dto->area;
            }

            $processing = $this->sandboxService->getProcGeneratePyramidVector($datastoreId);

            $requestBody = [
                'processing' => $processing,
                'inputs' => ['stored_data' => [$dto->vectordb_id]],
                'output' => ['stored_data' => [
                    'name' => $dto->technical_name,
                    'storage_tags' => ['PYRAMIDE'],
                ]],
                'parameters' => $parameters,
            ];

            // Ajout d'une execution de traitement
            $processingExecution = $this->processingApiService->addExecution($datastoreId, $requestBody);
            $pyramidId = $processingExecution['output']['stored_data']['_id'];

            $pyramidTags = [
                CommonTags::DATASHEET_NAME => $vectordb['tags'][CommonTags::DATASHEET_NAME],
                'upload_id' => $vectordb['tags']['upload_id'],
                'proc_int_id' => $vectordb['tags']['proc_int_id'],
                'vectordb_id' => $dto->vectordb_id,
                'proc_pyr_creat_id' => $processingExecution['_id'],
                'is_sample' => is_null($dto->area) ? 'false' : 'true',
            ];
            if (isset($vectordb['tags'][CommonTags::PRODUCER])) {
                $pyramidTags[CommonTags::PRODUCER] = $vectordb['tags'][CommonTags::PRODUCER];
            }
            if (isset($vectordb['tags'][CommonTags::PRODUCTION_YEAR])) {
                $pyramidTags[CommonTags::PRODUCTION_YEAR] = $vectordb['tags'][CommonTags::PRODUCTION_YEAR];
            }

            $this->storedDataApiService->addTags($datastoreId, $pyramidId, $pyramidTags);
            $this->processingApiService->launchExecution($datastoreId, $processingExecution['_id']);

            return new JsonResponse();
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{pyramidId}/tms', name: 'tms_add', methods: ['POST'])]
    public function addTms(
        string $datastoreId,
        string $pyramidId,
        #[MapRequestPayload] PyramidVectorTmsServiceDTO $dto,
    ): JsonResponse {
        try {
            $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId);

            // TODO Suppression de l'Upload ?
            // TODO Suppression de la base de donnees
            // NOTE on peut difficilement supprimer la base de données parce qu'il y a peut-être d'autres entités qui en dépendent

            // création de requête pour la config
            $typeInfos = $this->getConfigTypeInfos($dto, $pyramid);
            $configRequestBody = $this->getConfigRequestBody($datastoreId, ConfigurationTypes::WMTSTMS, $dto, $typeInfos);

            $offering = $this->cartesServiceApiService->saveService($datastoreId, $pyramidId, $dto, ConfigurationTypes::WMTSTMS, $configRequestBody);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{pyramidId}/tms/{offeringId}/edit', name: 'tms_edit', methods: ['POST'])]
    public function editTms(
        string $datastoreId,
        string $pyramidId,
        string $offeringId,
        #[MapRequestPayload] PyramidVectorTmsServiceDTO $dto,
    ): JsonResponse {
        try {
            // récup config et offering existants
            $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id']);
            $oldOffering['configuration'] = $oldConfiguration;

            $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId);

            // création de requête pour la config
            $typeInfos = $this->getConfigTypeInfos($dto, $pyramid);
            $configRequestBody = $this->getConfigRequestBody($datastoreId, ConfigurationTypes::WMTSTMS, $dto, $typeInfos, $oldConfiguration);

            $offering = $this->cartesServiceApiService->saveService($datastoreId, $pyramidId, $dto, ConfigurationTypes::WMTSTMS, $configRequestBody, $oldOffering);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed> $pyramid
     */
    private function getConfigTypeInfos(PyramidVectorTmsServiceDTO $dto, array $pyramid): array
    {
        // Recherche de bottom_level et top_level
        $levels = $this->getPyramidZoomLevels($pyramid);

        return [
            'title' => $dto->service_name,
            'abstract' => json_encode($dto->description),
            'keywords' => [...$dto->category, ...$dto->keywords, ...$dto->free_keywords],
            'used_data' => [[
                'bottom_level' => $levels['bottom_level'],
                'top_level' => $levels['top_level'],
                'stored_data' => $pyramid['_id'],
            ]],
        ];
    }

    /**
     * @param array<PyramidVectorCompositionDTO> $composition
     */
    private function getLevels($composition): array
    {
        $levels = [];
        foreach ($composition as $tableComposition) {
            $levels[] = $tableComposition->bottom_level;
            $levels[] = $tableComposition->top_level;
        }
        $levels = array_unique($levels, SORT_NUMERIC);
        sort($levels, SORT_NUMERIC);

        return $levels;
    }
}
