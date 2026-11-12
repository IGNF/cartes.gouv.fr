<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StaticFileTypes;
use App\Constants\EntrepotApi\StoredDataTags;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\CommonDTO;
use App\Dto\Services\Form\WmsRasterWmtsFormDTO;
use App\Dto\Services\PyramidRaster\PyramidRasterGenerateDTO;
use App\Exception\AppException;
use App\Security\User;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\ServiceConfigurationRequestBuilder;
use App\Services\EntrepotApi\StaticApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\MultipartPayloadMapper;
use App\Services\SandboxService;
use App\Services\ServiceFormFileValidator;
use App\Utils;
use App\Workflow\UploadIntegrationWorkflow;
use OpenApi\Attributes as OA;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] pyramid-raster', description: 'Génération de pyramides de tuiles raster et création/modification des services associés')]
final class PyramidRasterController extends AbstractController implements ApiControllerInterface
{
    private readonly HttpClientInterface $httpClient;

    public function __construct(
        private readonly DatastoreApiService $datastoreApiService,
        private readonly ConfigurationApiService $configurationApiService,
        private readonly StoredDataApiService $storedDataApiService,
        private readonly ProcessingApiService $processingApiService,
        private readonly SandboxService $sandboxService,
        private readonly CartesServiceApiService $cartesServiceApiService,
        private readonly UrlGeneratorInterface $urlGenerator,
        private readonly AnnexeApiService $annexeApiService,
        private readonly StaticApiService $staticApiService,
        private readonly Filesystem $fs,
        private readonly MultipartPayloadMapper $multipartPayloadMapper,
        private readonly ServiceFormFileValidator $serviceFormFileValidator,
        private readonly LoggerInterface $logger,
        ParameterBagInterface $params,
        HttpClientInterface $httpClient,
    ) {
        $this->httpClient = $httpClient->withOptions([
            'proxy' => $params->get('http_proxy'),
        ]);
    }

    #[Route('/add', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, #[MapRequestPayload] PyramidRasterGenerateDTO $dto): JsonResponse
    {
        $datastore = $this->datastoreApiService->get($datastoreId);
        $processingId = $this->sandboxService->getProcGeneratePyramidRaster($datastoreId);

        $wmsvOffering = $this->configurationApiService->getOffering($datastoreId, $dto->wmsv_offering_id)->array();
        $wmsvConfiguration = $this->configurationApiService->get($datastoreId, $wmsvOffering['configuration']['_id'])->array();

        $vectorDbId = $wmsvConfiguration['type_infos']['used_data'][0]['stored_data'] ?? null;
        if (null === $vectorDbId) {
            throw new AppException(sprintf('Donnée stockée du type %s référencée par le service WMS-Vecteur non trouvée', StoredDataTypes::VECTOR_DB), Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $vectordb = $this->storedDataApiService->get($datastoreId, $vectorDbId)->array();

        $serviceEndpoint = $this->datastoreApiService->getEndpoint($datastoreId, $wmsvOffering['endpoint']['_id']);
        $endpointUrlBase = $serviceEndpoint['endpoint']['urls'][0]['url'] ?? null;

        if (null === $endpointUrlBase) {
            throw new AppException('URL du service WMS-Vecteur non trouvée', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $zoomRange = array_values($dto->zoom_range);
        sort($zoomRange);
        $harvestLevels = array_map(strval(...), array_reverse(range($zoomRange[0], $zoomRange[1], 1), false));

        $requestBody = [
            'processing' => $processingId,
            'output' => [
                'stored_data' => [
                    'name' => $dto->technical_name,
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
                'harvest_area' => $dto->wmsv_config_bbox,
            ],
        ];

        if ($dto->email_notification) {
            /** @var User */
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

        // avant l’exécution : une légende inaccessible ne laisse rien à défaire
        $legendFilePath = $this->fetchWmsvLegend($endpointUrlBase, $wmsvOffering);
        $processingExecution = null;
        $legendAnnexe = null;

        try {
            $processingExecution = $this->processingApiService->addExecution($datastoreId, $requestBody)->array();
            $pyramidId = $processingExecution['output']['stored_data']['_id'];

            // base vecteur créée hors du parcours de dépôt : tags de lignée absents
            $pyramidTags = array_filter([
                ...UploadIntegrationWorkflow::forwardedTags($vectordb['tags'] ?? []),
                StoredDataTags::UPLOAD_ID => $vectordb['tags'][StoredDataTags::UPLOAD_ID] ?? null,
                StoredDataTags::PROC_INT_ID => $vectordb['tags'][StoredDataTags::PROC_INT_ID] ?? null,
                StoredDataTags::VECTORDB_ID => $vectorDbId,
                StoredDataTags::PROC_PYR_CREAT_ID => $processingExecution['_id'],
            ], fn ($value) => null !== $value);

            $legendAnnexe = $this->saveLegendInAnnexe($datastoreId, $pyramidId, $legendFilePath, $wmsvConfiguration['tags'][CommonTags::DATASHEET_NAME] ?? null);
            $legendAnnexeUrlAbs = $this->getParameter('annexes_url').'/'.$datastore['technical_name'].$legendAnnexe['paths'][0];

            $this->storedDataApiService->addTags($datastoreId, $pyramidId, $pyramidTags)->await();
            $this->storedDataApiService->modify($datastoreId, $pyramidId, [
                'extra' => [
                    'legend' => [
                        'url' => $legendAnnexeUrlAbs,
                        'annexe_id' => $legendAnnexe['_id'],
                    ],
                ],
            ])->await();
            $this->processingApiService->launchExecution($datastoreId, $processingExecution['_id'])->await();
        } catch (\Throwable $e) {
            if (null !== $processingExecution) {
                $this->cancelGeneration($datastoreId, $processingExecution['_id'], $legendAnnexe['_id'] ?? null);
            }
            throw $e;
        } finally {
            $this->fs->remove(dirname($legendFilePath));
        }

        return new JsonResponse();
    }

    /**
     * Publication depuis le nouveau formulaire : multipart avec le champ JSON `data` (WmsRasterWmtsFormDTO) et les fichiers `thumbnail`, `attribution_logo`.
     */
    #[Route('/{pyramidId}/wms-raster-wmts/publish', name: 'wms_raster_wmts_publish', methods: ['POST'])]
    public function publish(string $datastoreId, string $pyramidId, #[MapQueryParameter] string $type, Request $request): JsonResponse
    {
        $acceptedTypes = [ConfigurationTypes::WMSRASTER, ConfigurationTypes::WMTSTMS];
        if (!in_array($type, $acceptedTypes, true)) {
            throw new AppException(sprintf('Le type %s n’est pas accepté. Les types acceptés sont %s.', $type, implode(', ', $acceptedTypes)), Response::HTTP_BAD_REQUEST);
        }

        $dto = $this->multipartPayloadMapper->map($request, WmsRasterWmtsFormDTO::class);
        [$thumbnail, $attributionLogo] = $this->serviceFormFileValidator->images($request, 'thumbnail', 'attribution_logo');

        $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId)->array();
        if (StoredDataTypes::ROK4_PYRAMID_RASTER !== ($pyramid['type'] ?? null)) {
            throw new AppException('La donnée choisie n’est pas une pyramide raster', Response::HTTP_BAD_REQUEST);
        }
        $levels = ServiceConfigurationRequestBuilder::getPyramidZoomLevels($pyramid);
        $configType = ConfigurationTypes::WMSRASTER === $type ? 'wmsr' : 'wmts';
        // nom temporaire : l’identifiant de la configuration n’existe pas encore
        $legendStaticId = $this->saveLegendInStatic($datastoreId, $pyramid, $configType, $levels)['_id'];

        $offering = $this->cartesServiceApiService->publishFromForm(
            $datastoreId,
            $pyramidId,
            $dto,
            $type,
            [
                'title' => $dto->title,
                'abstract' => $dto->description,
                'keywords' => $dto->themes,
                'used_data' => [[
                    'bottom_level' => $levels['bottom_level'],
                    'top_level' => $levels['top_level'],
                    'stored_data' => $pyramidId,
                ]],
                'styles' => [$legendStaticId],
            ],
            $thumbnail,
            $attributionLogo,
            // renommage avant l’offre : un échec annule encore la configuration
            function (string $configurationId) use ($datastoreId, $legendStaticId, $configType): void {
                $this->staticApiService->modifyInfo($datastoreId, $legendStaticId, [
                    'name' => sprintf('config_%s_style_%s', $configurationId, $configType),
                ])->await();
            },
            // après l’offre, le fichier reste : le flux l’utilise
            function () use ($datastoreId, $legendStaticId): void {
                try {
                    $this->staticApiService->delete($datastoreId, $legendStaticId)->await();
                } catch (\Throwable $e) {
                    $this->logger->warning('{class}: Failed to remove legend style file {staticId} after a failed publication: {error}', [
                        'class' => self::class,
                        'staticId' => $legendStaticId,
                        'exception' => $e,
                        'error' => $e->getMessage(),
                    ]);
                }
            },
        );

        return $this->json($offering, Response::HTTP_CREATED);
    }

    #[Route('/{pyramidId}/wms-raster-wmts', name: 'wms_raster_wmts_add', methods: ['POST'])]
    public function addWmsRasterWmts(
        string $datastoreId,
        string $pyramidId,
        #[MapQueryParameter] string $type,
        #[MapRequestPayload] CommonDTO $dto,
    ): JsonResponse {
        $acceptedTypes = [ConfigurationTypes::WMSRASTER, ConfigurationTypes::WMTSTMS];
        if (!in_array($type, $acceptedTypes)) {
            throw new AppException(sprintf("Le type %s n'est pas accepté. Les types acceptés sont %s.", $type, implode(', ', $acceptedTypes)), Response::HTTP_BAD_REQUEST);
        }

        $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId)->array();

        // création de requête pour la config
        $typeInfos = $this->getConfigTypeInfos($dto, $datastoreId, $pyramid, $type);
        $configRequestBody = ServiceConfigurationRequestBuilder::buildFromCommonDto($type, $dto, $typeInfos);

        $offering = $this->cartesServiceApiService->saveService($datastoreId, $pyramidId, $dto, $type, $configRequestBody);

        $configType = ConfigurationTypes::WMSRASTER === $type ? 'wmsr' : 'wmts';
        $finalStyleFileName = sprintf('config_%s_style_%s', $offering['configuration']['_id'], $configType);
        $this->staticApiService->modifyInfo($datastoreId, $typeInfos['styles'][0], [
            'name' => $finalStyleFileName,
        ])->await();

        return $this->json($offering);
    }

    #[Route('/{pyramidId}/wms-raster-wmts/{offeringId}/edit', name: 'wms_raster_wmts_edit', methods: ['POST'])]
    public function editWmsRasterWmts(
        string $datastoreId,
        string $pyramidId,
        string $offeringId,
        #[MapQueryParameter] string $type,
        #[MapRequestPayload] CommonDTO $dto,
    ): JsonResponse {
        $acceptedTypes = [ConfigurationTypes::WMSRASTER, ConfigurationTypes::WMTSTMS];
        if (!in_array($type, $acceptedTypes)) {
            throw new AppException(sprintf("Le type %s n'est pas accepté. Les types acceptés sont %s.", $type, implode(', ', $acceptedTypes)), Response::HTTP_BAD_REQUEST);
        }

        // récup config et offering existants
        $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();
        $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id'])->array();
        $oldOffering['configuration'] = $oldConfiguration;

        $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId)->array();

        // création de requête pour la config
        $typeInfos = $this->getConfigTypeInfos($dto, $datastoreId, $pyramid, $type, $oldConfiguration['_id']);
        $configRequestBody = ServiceConfigurationRequestBuilder::buildFromCommonDto($type, $dto, $typeInfos, $oldConfiguration);

        $offering = $this->cartesServiceApiService->saveService($datastoreId, $pyramidId, $dto, $type, $configRequestBody, $oldOffering);

        return $this->json($offering);
    }

    /**
     * @param array<mixed> $pyramid
     *
     * @return array<mixed>
     */
    private function getConfigTypeInfos(CommonDTO $dto, string $datastoreId, array $pyramid, string $serviceType, ?string $configurationId = null): array
    {
        $levels = ServiceConfigurationRequestBuilder::getPyramidZoomLevels($pyramid);
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

    // au mieux : l’erreur d’origine est celle qui remonte ; supprimer l’exécution non lancée supprime sa pyramide (mesuré le 10/11/2026)
    private function cancelGeneration(string $datastoreId, string $executionId, ?string $legendAnnexeId): void
    {
        try {
            $this->processingApiService->removeExecution($datastoreId, $executionId)->await();
        } catch (\Throwable) {
        }

        if (null !== $legendAnnexeId) {
            try {
                $this->annexeApiService->remove($datastoreId, $legendAnnexeId)->await();
            } catch (\Throwable) {
            }
        }
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
            'width' => 20, // largeur et hauteur des symboles
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

    /**
     * @return array<mixed>
     */
    private function saveLegendInAnnexe(string $datastoreId, string $storedDataId, string $legendFilePath, ?string $datasheetName): array
    {
        $path = "/legend/{$storedDataId}.png";

        $existingAnnexes = $this->annexeApiService->getAll($datastoreId, null, $path)->resolve();
        if (count($existingAnnexes) > 0) {
            $existingAnnexe = $existingAnnexes[0];

            return $this->annexeApiService->replaceFile($datastoreId, $existingAnnexe['_id'], $legendFilePath);
        }

        $labels = ['type=legend'];
        if (null !== $datasheetName) {
            $labels[] = CommonTags::DATASHEET_NAME.'='.$datasheetName;
        }

        return $this->annexeApiService->add($datastoreId, $legendFilePath, [$path], $labels, true);
    }

    /**
     * @param array<mixed>         $pyramid
     * @param array<string,string> $zoomLevels
     *
     * @return array<mixed>
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
        try {
            $this->fs->dumpFile($styleFilePath, json_encode($rok4Style, JSON_THROW_ON_ERROR));

            if (null !== $configurationId) {
                $finalStyleFileName = sprintf('config_%s_style_%s', $configurationId, $configType);
                $existingStatics = $this->staticApiService->getAll($datastoreId, [
                    'type' => StaticFileTypes::ROK4_STYLE,
                    'name' => $finalStyleFileName,
                ])->resolve();
                if (count($existingStatics) > 0) {
                    $existingStatic = $existingStatics[0];

                    return $this->staticApiService->replaceFile($datastoreId, $existingStatic['_id'], $styleFilePath);
                }
            }

            return $this->staticApiService->add($datastoreId, $styleFilePath, $tmpStyleFileName, StaticFileTypes::ROK4_STYLE);
        } finally {
            $this->fs->remove($styleFileDir);
        }
    }
}
