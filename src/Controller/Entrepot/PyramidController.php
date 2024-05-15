<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Pyramid\AddPyramidDTO;
use App\Dto\Pyramid\CompositionDTO;
use App\Dto\Pyramid\PublishPyramidDTO;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\CswMetadataHelper;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\MetadataApiService;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/pyramid',
    name: 'cartesgouvfr_api_pyramid_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class PyramidController extends ServiceController implements ApiControllerInterface
{
    public const TOP_LEVEL_DEFAULT = 5;
    public const BOTTOM_LEVEL_DEFAULT = 18;

    public function __construct(
        DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private StoredDataApiService $storedDataApiService,
        private ProcessingApiService $processingApiService,
        private CartesServiceApiService $cartesServiceApiService,
        private ParameterBagInterface $parameterBag,
        MetadataApiService $metadataApiService,
        CapabilitiesService $capabilitiesService,
        CswMetadataHelper $cswMetadataHelper,
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApiService, $metadataApiService, $capabilitiesService, $cswMetadataHelper);
    }

    #[Route('/add', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, #[MapRequestPayload] AddPyramidDTO $dto): JsonResponse
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

            $apiEntrepotProcessings = $this->parameterBag->get('api_entrepot')['processings'];

            $requestBody = [
                'processing' => $apiEntrepotProcessings['create_vect_pyr'],
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

            $this->storedDataApiService->addTags($datastoreId, $dto->vectordb_id, [
                'pyramid_id' => $pyramidId,
            ]);

            $pyramidTags = [
                CommonTags::DATASHEET_NAME => $vectordb['tags'][CommonTags::DATASHEET_NAME],
                'upload_id' => $vectordb['tags']['upload_id'],
                'proc_int_id' => $vectordb['tags']['proc_int_id'],
                'vectordb_id' => $dto->vectordb_id,
                'proc_pyr_creat_id' => $processingExecution['_id'],
                'is_sample' => is_null($dto->area) ? 'false' : 'true',
            ];

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
        #[MapRequestPayload] PublishPyramidDTO $dto
    ): JsonResponse {
        try {
            $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId);
            $datasheetName = $pyramid['tags'][CommonTags::DATASHEET_NAME];

            // TODO Suppression de l'Upload ?
            // TODO Suppression de la base de donnees
            // NOTE on peut difficilement supprimer la base de données parce qu'il y a peut-être d'autres entités qui en dépendent

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $pyramid);

            // Restriction d'acces
            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMTSTMS, $dto->share_with);

            // Ajout de la configuration
            $configuration = $this->configurationApiService->add($datastoreId, $configRequestBody);
            $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], [
                CommonTags::DATASHEET_NAME => $pyramid['tags'][CommonTags::DATASHEET_NAME],
            ]);

            // Creation d'une offering
            $offering = $this->configurationApiService->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
            $offering['configuration'] = $configuration;

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
            $this->createOrUpdateMetadata($formData, $datastoreId, $datasheetName);

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
        #[MapRequestPayload] PublishPyramidDTO $dto
    ): JsonResponse {
        try {
            // récup anciens config et offering
            $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id']);

            $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId);
            $datasheetName = $pyramid['tags'][CommonTags::DATASHEET_NAME];

            // suppression anciens configs et offering
            $this->cartesServiceApiService->tmsUnpublish($datastoreId, $oldOffering, false);

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $pyramid);

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMTSTMS, $dto->share_with);

            // Ajout de la configuration
            $configuration = $this->configurationApiService->add($datastoreId, $configRequestBody);
            $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], $oldConfiguration['tags']);

            // Creation d'une offering
            $offering = $this->configurationApiService->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
            $offering['configuration'] = $configuration;

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
            $this->createOrUpdateMetadata($formData, $datastoreId, $datasheetName);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed> $pyramid
     */
    private function getConfigRequestBody(PublishPyramidDTO $dto, array $pyramid): array
    {
        // Recherche de bottom_level et top_level
        $levels = $this->getBottomAndToLevel($pyramid);

        $requestBody = [
            'type' => ConfigurationTypes::WMTSTMS,
            'name' => $dto->public_name,
            'layer_name' => $dto->technical_name,
            'type_infos' => [
                'title' => $dto->public_name,
                'abstract' => '.', // json_encode($dto->description), // TODO temporairement description vide, parce que les caractères spéciaux font planter le endpoint tms
                'keywords' => $dto->category,
                'used_data' => [[
                    'bottom_level' => $levels['bottom_level'],
                    'top_level' => $levels['top_level'],
                    'stored_data' => $pyramid['_id'],
                ]],
            ],
        ];

        if ('' !== $dto->attribution_text && '' !== $dto->attribution_url) {
            $requestBody['attribution'] = [
                'title' => $dto->attribution_text,
                'url' => $dto->attribution_url,
            ];
        }

        return $requestBody;
    }

    /**
     * @param array<CompositionDTO> $composition
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

    /**
     * @param array<mixed> $pyramid
     *
     * @return array
     */
    private function getBottomAndToLevel(array $pyramid)
    {
        if (!isset($pyramid['type_infos']) || !isset($pyramid['type_infos']['levels'])) {
            return ['bottom_level' => strval(self::BOTTOM_LEVEL_DEFAULT), 'top_level' => strval(self::TOP_LEVEL_DEFAULT)];
        }

        $levels = $pyramid['type_infos']['levels'];
        usort($levels, function (string $a, string $b) {
            return intval($a) - intval($b);
        });

        return ['bottom_level' => end($levels), 'top_level' => reset($levels)];
    }
}
