<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\Sandbox;
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
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/pyramid-vector',
    name: 'cartesgouvfr_api_pyramid_vector_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class PyramidVectorController extends ServiceController implements ApiControllerInterface
{
    public function __construct(
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private StoredDataApiService $storedDataApiService,
        private ProcessingApiService $processingApiService,
        SandboxService $sandboxService,
        CartesServiceApiService $cartesServiceApiService,
        CapabilitiesService $capabilitiesService,
        private CartesMetadataApiService $cartesMetadataApiService,
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
            $datasheetName = $pyramid['tags'][CommonTags::DATASHEET_NAME];

            // TODO Suppression de l'Upload ?
            // TODO Suppression de la base de donnees
            // NOTE on peut difficilement supprimer la base de données parce qu'il y a peut-être d'autres entités qui en dépendent

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $pyramid, false, $datastoreId);

            // Restriction d'acces
            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMTSTMS, $dto->share_with);

            // Ajout de la configuration
            $configuration = $this->configurationApiService->add($datastoreId, $configRequestBody);
            $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], [
                CommonTags::DATASHEET_NAME => $pyramid['tags'][CommonTags::DATASHEET_NAME],
            ]);

            // Creation d'une offering
            try {
                $offering = $this->configurationApiService->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
                $offering['configuration'] = $configuration;
            } catch (\Throwable $th) {
                // si la création de l'offering plante, on défait la création de la config
                $this->configurationApiService->remove($datastoreId, $configuration['_id']);
                throw $th;
            }

            // création d'une permission pour la communauté actuelle
            if ('your_community' === $dto->share_with) {
                $this->addPermissionForCurrentCommunity($datastoreId, $offering);
            }

            // création d'une permission pour la communauté config
            if (true === $dto->allow_view_data) {
                $communityId = $this->getParameter('config')['community_id'];
                $this->addPermissionForCommunity($datastoreId, $communityId, $offering);
            }

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $formData['identifier'] = Sandbox::LAYERNAME_PREFIX.$formData['identifier'];
            }
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $formData);

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

            $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId);
            $datasheetName = $pyramid['tags'][CommonTags::DATASHEET_NAME];

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $pyramid, true);

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMTSTMS, $dto->share_with);

            // Mise à jour de la configuration
            $configuration = $this->configurationApiService->replace($datastoreId, $oldConfiguration['_id'], $configRequestBody);

            // on recrée l'offering si changement d'endpoint, sinon demande la synchronisation
            if ($oldOffering['open'] !== $endpoint['open']) {
                $this->configurationApiService->removeOffering($datastoreId, $oldOffering['_id']);

                $offering = $this->configurationApiService->addOffering($datastoreId, $oldConfiguration['_id'], $endpoint['_id'], $endpoint['open']);
            } else {
                $offering = $this->configurationApiService->syncOffering($datastoreId, $offeringId);
            }

            if (false === $offering['open']) {
                // création d'une permission pour la communauté config
                if (true === $dto->allow_view_data) {
                    $communityId = $this->getParameter('config')['community_id'];
                    $this->addPermissionForCommunity($datastoreId, $communityId, $offering);
                } else {
                    $communityId = $this->getParameter('config')['community_id'];
                    $permissions = $this->datastoreApiService->getPermissions($datastoreId);

                    $targetPermission = array_filter($permissions, function ($permission) use ($offering, $communityId) {
                        return isset($permission['offerings'])
                            && in_array($offering['_id'], array_column($permission['offerings'], '_id'))
                            && isset($permission['beneficiary']['_id'])
                            && $permission['beneficiary']['_id'] === $communityId;
                    });

                    if (!empty($targetPermission)) {
                        $permissionId = reset($targetPermission)['_id'];
                        $this->datastoreApiService->removePermission($datastoreId, $permissionId);
                    }
                }
                // création d'une permission pour la communauté actuelle
                $this->addPermissionForCurrentCommunity($datastoreId, $offering);
            }

            $offering['configuration'] = $configuration;

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $formData['identifier'] = Sandbox::LAYERNAME_PREFIX.$formData['identifier'];
            }
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $formData);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed> $pyramid
     */
    private function getConfigRequestBody(PyramidVectorTmsServiceDTO $dto, array $pyramid, bool $editMode = false, ?string $datastoreId = null): array
    {
        // Recherche de bottom_level et top_level
        $levels = $this->getPyramidZoomLevels($pyramid);

        $requestBody = [
            'type' => ConfigurationTypes::WMTSTMS,
            'name' => $dto->service_name,
            'type_infos' => [
                'title' => $dto->service_name,
                'abstract' => json_encode($dto->description),
                'keywords' => $dto->category,
                'used_data' => [[
                    'bottom_level' => $levels['bottom_level'],
                    'top_level' => $levels['top_level'],
                    'stored_data' => $pyramid['_id'],
                ]],
            ],
        ];

        if (false === $editMode) {
            $requestBody['layer_name'] = $dto->technical_name;

            // rajoute le préfixe "sandbox." si c'est la communauté bac à sable
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $requestBody['layer_name'] = Sandbox::LAYERNAME_PREFIX.$requestBody['layer_name'];
            }
        }

        if ('' !== $dto->attribution_text && '' !== $dto->attribution_url) {
            $requestBody['attribution'] = [
                'title' => $dto->attribution_text,
                'url' => $dto->attribution_url,
            ];
        }

        return $requestBody;
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
