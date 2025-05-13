<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\Sandbox;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\CommonDTO;
use App\Exception\ApiException;
use App\Exception\AppException;
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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/pyramid-raster',
    name: 'cartesgouvfr_api_pyramid_raster_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[cartes.gouv.fr] pyramid-raster', description: 'Génération de pyramides de tuiles raster et création/modification des services associés')]
class PyramidRasterController extends ServiceController implements ApiControllerInterface
{
    public function __construct(
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private StoredDataApiService $storedDataApiService,
        private ProcessingApiService $processingApiService,
        SandboxService $sandboxService,
        CartesServiceApiService $cartesServiceApiService,
        private CapabilitiesService $capabilitiesService,
        private CartesMetadataApiService $cartesMetadataApiService,
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApiService, $capabilitiesService, $cartesMetadataApiService, $sandboxService);
    }

    #[Route('/add', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            $processingId = $this->sandboxService->getProcGeneratePyramidRaster($datastoreId);

            $wmsvOffering = $this->configurationApiService->getOffering($datastoreId, $data['wmsv_offering_id']);
            $wmsvConfiguration = $this->configurationApiService->get($datastoreId, $wmsvOffering['configuration']['_id']);

            $vectorDbId = $wmsvConfiguration['type_infos']['used_data'][0]['stored_data'] ?? null;
            if (null === $vectorDbId) {
                throw new AppException(sprintf('Donnée stockée du type %s référencée par le service WMS-Vecteur non trouvée', StoredDataTypes::VECTOR_DB), Response::HTTP_BAD_REQUEST);
            }

            $vectordb = $this->storedDataApiService->get($datastoreId, $vectorDbId);

            $serviceEndpoint = $this->datastoreApiService->getEndpoint($datastoreId, $wmsvOffering['endpoint']['_id']);
            $harvestUrl = $serviceEndpoint['endpoint']['urls'][0]['url'] ?? null;

            if (null === $harvestUrl) {
                throw new AppException('URL du service WMS-Vecteur non trouvée', Response::HTTP_BAD_REQUEST);
            }

            $zoomRange = $data['zoom_range'];
            $harvestLevels = array_map(fn ($v) => strval($v), array_reverse(range($zoomRange[0], $zoomRange[1], 1), false));

            $requestBody = [
                'processing' => $processingId,
                'output' => [
                    'stored_data' => [
                        'name' => $data['technical_name'],
                    ],
                ],
                'parameters' => [
                    'samplesperpixel' => 3,
                    'sampleformat' => 'UINT8',
                    'tms' => 'PM',
                    'compression' => 'jpg',
                    'bottom' => strval($zoomRange[1]),
                    'harvest_levels' => $harvestLevels,

                    'harvest_format' => 'image/jpeg',
                    'harvest_url' => $harvestUrl,
                    'harvest_layers' => $wmsvOffering['layer_name'],
                    'harvest_area' => $data['wmsv_config_bbox'],
                ],
            ];

            $processingExecution = $this->processingApiService->addExecution($datastoreId, $requestBody);
            $pyramidId = $processingExecution['output']['stored_data']['_id'];

            $pyramidTags = [
                CommonTags::DATASHEET_NAME => $vectordb['tags'][CommonTags::DATASHEET_NAME],
                'upload_id' => $vectordb['tags']['upload_id'],
                'proc_int_id' => $vectordb['tags']['proc_int_id'],
                'vectordb_id' => $vectorDbId,
                'proc_pyr_creat_id' => $processingExecution['_id'],
            ];

            $this->storedDataApiService->addTags($datastoreId, $pyramidId, $pyramidTags);
            $this->processingApiService->launchExecution($datastoreId, $processingExecution['_id']);

            return new JsonResponse();
        } catch (ApiException|AppException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{pyramidId}/wms-raster-wmts', name: 'wms_raster_wmts_add', methods: ['POST'])]
    public function addWmsRasterWmts(
        string $datastoreId,
        string $pyramidId,
        #[MapQueryParameter] string $type,
        #[MapRequestPayload] CommonDTO $dto,
    ): JsonResponse {
        try {
            $acceptedTypes = [ConfigurationTypes::WMSRASTER, ConfigurationTypes::WMTSTMS];
            if (!in_array($type, $acceptedTypes)) {
                throw new AppException(sprintf("Le type %s n'est pas accepté. Les types acceptés sont %s.", $type, join(', ', $acceptedTypes)), Response::HTTP_BAD_REQUEST);
            }

            $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId);
            $datasheetName = $pyramid['tags'][CommonTags::DATASHEET_NAME];

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $pyramid, $type, false, $datastoreId);

            // Restriction d'acces
            $endpoint = $this->getEndpointByShareType($datastoreId, $type, $dto->share_with);

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
            if (true === filter_var($dto->allow_view_data, FILTER_VALIDATE_BOOLEAN)) {
                $communityId = $this->getParameter('config')['community_id'];
                $this->addPermissionForCommunity($datastoreId, $communityId, $offering);
            }

            // Création ou mise à jour du capabilities
            try {
                if (ConfigurationTypes::WMSRASTER === $configuration['type']) {
                    $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
                } elseif (ConfigurationTypes::WMTSTMS === $configuration['type'] && StoredDataTypes::ROK4_PYRAMID_RASTER === $pyramid['type']) {
                    $offeringUrl = array_values(array_filter($offering['urls'], fn ($url) => 'WMTS' === $url['type']))[0] ?? null;
                    if (null !== $offeringUrl) {
                        $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offeringUrl['url']);
                    }
                }
            } catch (\Exception $e) {
            }

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $formData['identifier'] = Sandbox::LAYERNAME_PREFIX.$formData['identifier'];
            }
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $formData);

            return $this->json($offering);
        } catch (ApiException|AppException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{pyramidId}/wms-raster-wmts/{offeringId}/edit', name: 'wms_raster_wmts_edit', methods: ['POST'])]
    public function editWmsRasterWmts(
        string $datastoreId,
        string $pyramidId,
        string $offeringId,
        #[MapQueryParameter] string $type,
        #[MapRequestPayload] CommonDTO $dto,
    ): JsonResponse {
        try {
            $acceptedTypes = [ConfigurationTypes::WMSRASTER, ConfigurationTypes::WMTSTMS];
            if (!in_array($type, $acceptedTypes)) {
                throw new AppException(sprintf("Le type %s n'est pas accepté. Les types acceptés sont %s.", $type, join(', ', $acceptedTypes)), Response::HTTP_BAD_REQUEST);
            }

            // récup config et offering existants
            $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id']);

            $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId);
            $datasheetName = $pyramid['tags'][CommonTags::DATASHEET_NAME];

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $pyramid, $type, true);

            $endpoint = $this->getEndpointByShareType($datastoreId, $type, $dto->share_with);

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
                if (true === filter_var($dto->allow_view_data, FILTER_VALIDATE_BOOLEAN)) {
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

            // Création ou mise à jour du capabilities
            try {
                if (ConfigurationTypes::WMSRASTER === $configuration['type']) {
                    $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
                } elseif (ConfigurationTypes::WMTSTMS === $configuration['type'] && StoredDataTypes::ROK4_PYRAMID_RASTER === $pyramid['type']) {
                    $offeringUrl = array_values(array_filter($offering['urls'], fn ($url) => 'WMTS' === $url['type']))[0] ?? null;
                    if (null !== $offeringUrl) {
                        $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offeringUrl['url']);
                    }
                }
            } catch (\Exception $e) {
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

    /**
     * @param array<mixed> $pyramid
     */
    private function getConfigRequestBody(CommonDTO $dto, array $pyramid, string $type, bool $editMode = false, ?string $datastoreId = null): array
    {
        $levels = $this->getPyramidZoomLevels($pyramid);

        $requestBody = [
            'type' => $type,
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
}
