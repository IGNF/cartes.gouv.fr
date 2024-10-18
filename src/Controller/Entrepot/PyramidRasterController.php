<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\Sandbox;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Controller\ApiControllerInterface;
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
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/pyramid-raster',
    name: 'cartesgouvfr_api_pyramid_raster_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
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

    #[Route('/{pyramidId}/wms-raster', name: 'wms_raster_add', methods: ['POST'])]
    public function addWmsRaster(
        string $datastoreId,
        string $pyramidId,
        Request $request
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);
            $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId);
            $datasheetName = $pyramid['tags'][CommonTags::DATASHEET_NAME];

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($data, $pyramid, false, $datastoreId);

            // Restriction d'acces
            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMSRASTER, $data['share_with']);

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
            if ('your_community' === $data['share_with']) {
                $this->addPermissionForCurrentCommunity($datastoreId, $offering);
            }

            // Création ou mise à jour du capabilities
            try {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            } catch (\Exception $e) {
            }

            // création ou mise à jour de metadata
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $data['identifier'] = Sandbox::LAYERNAME_PREFIX.$data['identifier'];
            }
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $data);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{pyramidId}/wms-raster/{offeringId}/edit', name: 'wms_raster_edit', methods: ['POST'])]
    public function editWmsRaster(
        string $datastoreId,
        string $pyramidId,
        string $offeringId,
        Request $request
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);

            // récup config et offering existants
            $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id']);

            $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId);
            $datasheetName = $pyramid['tags'][CommonTags::DATASHEET_NAME];

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($data, $pyramid, true);

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMSRASTER, $data['share_with']);

            // Mise à jour de la configuration
            $configuration = $this->configurationApiService->replace($datastoreId, $oldConfiguration['_id'], $configRequestBody);

            // on recrée l'offering si changement d'endpoint, sinon demande la synchronisation
            if ($oldOffering['open'] !== $endpoint['open']) {
                $this->configurationApiService->removeOffering($datastoreId, $oldOffering['_id']);

                $offering = $this->configurationApiService->addOffering($datastoreId, $oldConfiguration['_id'], $endpoint['_id'], $endpoint['open']);

                if (false === $offering['open']) {
                    // création d'une permission pour la communauté actuelle
                    $this->addPermissionForCurrentCommunity($datastoreId, $offering);
                }
            } else {
                $offering = $this->configurationApiService->syncOffering($datastoreId, $offeringId);
            }

            $offering['configuration'] = $configuration;

            // Création ou mise à jour du capabilities
            try {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            } catch (\Exception $e) {
            }

            // création ou mise à jour de metadata
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $data['identifier'] = Sandbox::LAYERNAME_PREFIX.$data['identifier'];
            }
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $data);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed> $data
     * @param array<mixed> $pyramid
     */
    private function getConfigRequestBody(array $data, array $pyramid, bool $editMode = false, ?string $datastoreId = null): array
    {
        $levels = $this->getPyramidZoomLevels($pyramid);

        $requestBody = [
            'type' => ConfigurationTypes::WMSRASTER,
            'name' => $data['public_name'],
            'type_infos' => [
                'title' => $data['public_name'],
                'abstract' => json_encode($data['description']),
                'keywords' => $data['category'],
                'used_data' => [[
                    'bottom_level' => $levels['bottom_level'],
                    'top_level' => $levels['top_level'],
                    'stored_data' => $pyramid['_id'],
                ]],
            ],
        ];

        if (false === $editMode) {
            $requestBody['layer_name'] = $data['technical_name'];

            // rajoute le préfixe "sandbox." si c'est la communauté bac à sable
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $requestBody['layer_name'] = Sandbox::LAYERNAME_PREFIX.$requestBody['layer_name'];
            }
        }

        if ('' !== $data['attribution_text'] && '' !== $data['attribution_url']) {
            $requestBody['attribution'] = [
                'title' => $data['attribution_text'],
                'url' => $data['attribution_url'],
            ];
        }

        return $requestBody;
    }
}
