<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StaticFileTypes;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\CommonDTO;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StaticApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\SandboxService;
use App\Utils;
use OpenApi\Attributes as OA;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Uid\Uuid;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route(
    '/api/datastores/{datastoreId}/pyramid-raster',
    name: 'cartesgouvfr_api_pyramid_raster_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[cartes.gouv.fr] pyramid-raster', description: 'Génération de pyramides de tuiles raster et création/modification des services associés')]
class PyramidRasterController extends ServiceController implements ApiControllerInterface
{
    private HttpClientInterface $httpClient;

    public function __construct(
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private StoredDataApiService $storedDataApiService,
        private ProcessingApiService $processingApiService,
        SandboxService $sandboxService,
        private CartesServiceApiService $cartesServiceApiService,
        CapabilitiesService $capabilitiesService,
        CartesMetadataApiService $cartesMetadataApiService,
        private UrlGeneratorInterface $urlGenerator,
        private AnnexeApiService $annexeApiService,
        private StaticApiService $staticApiService,
        private Filesystem $fs,
        ParameterBagInterface $params,
        HttpClientInterface $httpClient,
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApiService, $capabilitiesService, $cartesMetadataApiService, $sandboxService);

        $this->httpClient = $httpClient->withOptions([
            'proxy' => $params->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    #[Route('/add', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            $datastore = $this->datastoreApiService->get($datastoreId);
            $processingId = $this->sandboxService->getProcGeneratePyramidRaster($datastoreId);

            $wmsvOffering = $this->configurationApiService->getOffering($datastoreId, $data['wmsv_offering_id']);
            $wmsvConfiguration = $this->configurationApiService->get($datastoreId, $wmsvOffering['configuration']['_id']);

            $vectorDbId = $wmsvConfiguration['type_infos']['used_data'][0]['stored_data'] ?? null;
            if (null === $vectorDbId) {
                throw new AppException(sprintf('Donnée stockée du type %s référencée par le service WMS-Vecteur non trouvée', StoredDataTypes::VECTOR_DB), Response::HTTP_BAD_REQUEST);
            }

            $vectordb = $this->storedDataApiService->get($datastoreId, $vectorDbId);

            $serviceEndpoint = $this->datastoreApiService->getEndpoint($datastoreId, $wmsvOffering['endpoint']['_id']);
            $endpointUrlBase = $serviceEndpoint['endpoint']['urls'][0]['url'] ?? null;

            if (null === $endpointUrlBase) {
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
                    'harvest_url' => $endpointUrlBase,
                    'harvest_layers' => $wmsvOffering['layer_name'],
                    'harvest_area' => $data['wmsv_config_bbox'],
                ],
            ];

            if (isset($data['email_notification']) && true === $data['email_notification']) {
                /** @var \App\Security\User */
                $user = $this->getUser();
                $userEmail = $user->getEmail();
                $datasheetName = $vectordb['tags'][CommonTags::DATASHEET_NAME] ?? null;

                if ($userEmail && $datasheetName) {
                    $baseUrl = $this->urlGenerator->generate('cartesgouvfr_app', [], UrlGeneratorInterface::ABSOLUTE_URL);

                    $requestBody['callback'] = [
                        'type' => 'email',
                        'to_address' => [$userEmail],
                        'entity_url' => sprintf(
                            '%stableau-de-bord/entrepots/{{ datastore }}/donnees/{{ output }}/details?datasheetName=%s',
                            $baseUrl,
                            urlencode($datasheetName)
                        ),
                    ];
                }
            }

            $processingExecution = $this->processingApiService->addExecution($datastoreId, $requestBody);
            $pyramidId = $processingExecution['output']['stored_data']['_id'];

            $pyramidTags = [
                CommonTags::DATASHEET_NAME => $vectordb['tags'][CommonTags::DATASHEET_NAME],
                'upload_id' => $vectordb['tags']['upload_id'],
                'proc_int_id' => $vectordb['tags']['proc_int_id'],
                'vectordb_id' => $vectorDbId,
                'proc_pyr_creat_id' => $processingExecution['_id'],
            ];
            if (isset($vectordb['tags'][CommonTags::PRODUCER])) {
                $pyramidTags[CommonTags::PRODUCER] = $vectordb['tags'][CommonTags::PRODUCER];
            }
            if (isset($vectordb['tags'][CommonTags::PRODUCTION_YEAR])) {
                $pyramidTags[CommonTags::PRODUCTION_YEAR] = $vectordb['tags'][CommonTags::PRODUCTION_YEAR];
            }

            $legendFilePath = $this->fetchWmsvLegend($endpointUrlBase, $wmsvOffering);
            $legendAnnexe = $this->saveLegendInAnnexe($datastoreId, $pyramidId, $legendFilePath, $wmsvConfiguration['tags'][CommonTags::DATASHEET_NAME]);
            $legendAnnexeUrlAbs = $this->getParameter('annexes_url').'/'.$datastore['technical_name'].$legendAnnexe['paths'][0];

            $this->storedDataApiService->addTags($datastoreId, $pyramidId, $pyramidTags);
            $this->storedDataApiService->modify($datastoreId, $pyramidId, [
                'extra' => [
                    'legend' => [
                        'url' => $legendAnnexeUrlAbs,
                        'annexe_id' => $legendAnnexe['_id'],
                    ],
                ],
            ]);
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

            // création de requête pour la config
            $typeInfos = $this->getConfigTypeInfos($dto, $datastoreId, $pyramid, $type);
            $configRequestBody = $this->getConfigRequestBody($datastoreId, $type, $dto, $typeInfos);

            $offering = $this->cartesServiceApiService->saveService($datastoreId, $pyramidId, $dto, $type, $configRequestBody);

            $configType = ConfigurationTypes::WMSRASTER === $type ? 'wmsr' : 'wmts';
            $finalStyleFileName = sprintf('config_%s_style_%s', $offering['configuration']['_id'], $configType);
            $this->staticApiService->modifyInfo($datastoreId, $typeInfos['styles'][0], [
                'name' => $finalStyleFileName,
            ]);

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
            $oldOffering['configuration'] = $oldConfiguration;

            $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId);

            // création de requête pour la config
            $typeInfos = $this->getConfigTypeInfos($dto, $datastoreId, $pyramid, $type, $oldConfiguration['_id']);
            $configRequestBody = $this->getConfigRequestBody($datastoreId, $type, $dto, $typeInfos, $oldConfiguration);

            $offering = $this->cartesServiceApiService->saveService($datastoreId, $pyramidId, $dto, $type, $configRequestBody, $oldOffering);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed> $pyramid
     */
    private function getConfigTypeInfos(CommonDTO $dto, string $datastoreId, array $pyramid, string $serviceType, ?string $configurationId = null): array
    {
        $levels = $this->getPyramidZoomLevels($pyramid);
        $configType = ConfigurationTypes::WMSRASTER === $serviceType ? 'wmsr' : 'wmts';

        $legendStatic = $this->saveLegendInStatic($datastoreId, $pyramid, $configType, $levels, $configurationId);

        return [
            'title' => $dto->service_name,
            'abstract' => json_encode($dto->description),
            'keywords' => [...$dto->category, ...$dto->keywords, ...$dto->free_keywords],
            'used_data' => [[
                'bottom_level' => $levels['bottom_level'],
                'top_level' => $levels['top_level'],
                'stored_data' => $pyramid['_id'],
            ]],
            'styles' => [$legendStatic['_id']],
        ];
    }

    /**
     * @param array<mixed> $wmsvOffering
     */
    private function fetchWmsvLegend(string $endpointUrlBase, array $wmsvOffering): string
    {
        $wmsvOfferingLegendUrl = $endpointUrlBase.'?'.http_build_query([
            'service' => 'WMS',
            'request' => 'GetLegendGraphic',
            'format' => 'image/png',
            'width' => 20,
            'height' => 20,
            'layer' => $wmsvOffering['layer_name'],
            'version' => Utils::get_version_from_service_url($wmsvOffering['urls'][0]['url']),
        ]);

        $responseContent = null;
        try {
            $response = $this->httpClient->request('GET', $wmsvOfferingLegendUrl);
            $responseContent = $response->getContent();
        } catch (\Throwable $th) {
            throw new AppException('Récupération de la légende GetLegendGraphic du service WMS-Vecteur échouée', Response::HTTP_INTERNAL_SERVER_ERROR, [], $th);
        }

        $styleFilesDir = $this->getParameter('style_files_path');
        $legendFileDir = $styleFilesDir.DIRECTORY_SEPARATOR.Uuid::v4();
        $legendFilePath = $legendFileDir.DIRECTORY_SEPARATOR.'legend_'.Uuid::v4().'.png';

        $this->fs->mkdir($legendFileDir);
        $this->fs->dumpFile($legendFilePath, $responseContent);

        return $legendFilePath;
    }

    private function saveLegendInAnnexe(string $datastoreId, string $storedDataId, string $legendFilePath, string $datasheetName): array
    {
        $path = "/legend/{$storedDataId}/legend.png";

        $existingAnnexes = $this->annexeApiService->getAll($datastoreId, null, $path);
        if (count($existingAnnexes) > 0) {
            $existingAnnexe = $existingAnnexes[0];

            return $this->annexeApiService->replaceFile($datastoreId, $existingAnnexe['_id'], $legendFilePath);
        }

        $labels = [
            CommonTags::DATASHEET_NAME.'='.$datasheetName,
            'type=legend',
        ];

        return $this->annexeApiService->add($datastoreId, $legendFilePath, [$path], $labels, true);
    }

    /**
     * @param array<mixed>         $pyramid
     * @param array<string,string> $zoomLevels
     */
    private function saveLegendInStatic(string $datastoreId, array $pyramid, string $configType, array $zoomLevels, ?string $configurationId = null): array
    {
        // config_[configuration_id]_style_[type_config]
        $tmpConfigUuid = Uuid::v4();
        $tmpStyleFileName = sprintf('config_%s_style_%s', "tmp_{$tmpConfigUuid}", $configType);

        $legendUrl = null;
        if (isset($pyramid['extra'], $pyramid['extra']['legend'], $pyramid['extra']['legend']['url'])) {
            $legendUrl = $pyramid['extra']['legend']['url'];
        }

        $legend = [
            'format' => 'image/png',
            'width' => 20,
            'height' => 20,
            'min_scale_denominator' => intval($zoomLevels['top_level']),
            'max_scale_denominator' => intval($zoomLevels['bottom_level']),
        ];

        if (null !== $legendUrl) {
            $legend['url'] = $legendUrl;
        }

        $rok4Style = [
            'identifier' => $pyramid['name'],
            'title' => $pyramid['name'],
            'legend' => $legend,
        ];

        $styleFilesDir = $this->getParameter('style_files_path');
        $styleFileDir = $styleFilesDir.DIRECTORY_SEPARATOR.Uuid::v4();
        $styleFilePath = $styleFileDir.DIRECTORY_SEPARATOR.'rok4style_'.Uuid::v4().'.json';

        $this->fs->mkdir($styleFileDir);
        $this->fs->dumpFile($styleFilePath, json_encode($rok4Style));

        if (null !== $configurationId) {
            $finalStyleFileName = sprintf('config_%s_style_%s', $configurationId, $configType);
            $existingStatics = $this->staticApiService->getAll($datastoreId, [
                'type' => StaticFileTypes::ROK4_STYLE,
                'name' => $finalStyleFileName,
            ]);
            if (count($existingStatics) > 0) {
                $existingStatic = $existingStatics[0];

                return $this->staticApiService->replaceFile($datastoreId, $existingStatic['_id'], $styleFilePath);
            }
        }

        return $this->staticApiService->add($datastoreId, $styleFilePath, $tmpStyleFileName, StaticFileTypes::ROK4_STYLE);
    }
}
