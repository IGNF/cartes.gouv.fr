<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StoredDataTags;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\Form\PyramidServiceFormDTO;
use App\Dto\Services\PyramidVector\PyramidVectorCompositionDTO;
use App\Dto\Services\PyramidVector\PyramidVectorGenerateDTO;
use App\Dto\Services\PyramidVector\PyramidVectorTmsServiceDTO;
use App\Exception\AppException;
use App\Security\User;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\ServiceConfigurationRequestBuilder;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\MultipartPayloadMapper;
use App\Services\SandboxService;
use App\Services\ServiceFormFileValidator;
use App\Workflow\UploadIntegrationWorkflow;
use OpenApi\Attributes as OA;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[Route(
    '/api/datastores/{datastoreId}/pyramid-vector',
    name: 'cartesgouvfr_api_pyramid_vector_',
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] pyramid-vector', description: 'Génération de pyramides de tuiles vectorielles et création/modification des services associés')]
final class PyramidVectorController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly ConfigurationApiService $configurationApiService,
        private readonly StoredDataApiService $storedDataApiService,
        private readonly ProcessingApiService $processingApiService,
        private readonly SandboxService $sandboxService,
        private readonly CartesServiceApiService $cartesServiceApiService,
        private readonly UrlGeneratorInterface $urlGenerator,
        private readonly MultipartPayloadMapper $multipartPayloadMapper,
        private readonly ServiceFormFileValidator $serviceFormFileValidator,
        private readonly LoggerInterface $logger,
    ) {
    }

    #[Route('/add', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, #[MapRequestPayload] PyramidVectorGenerateDTO $dto): JsonResponse
    {
        $vectordb = $this->storedDataApiService->get($datastoreId, $dto->vectordb_id)->array();

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

        // Ajout d'une execution de traitement
        $processingExecution = $this->processingApiService->addExecution($datastoreId, $requestBody)->array();
        $pyramidId = $processingExecution['output']['stored_data']['_id'];

        try {
            // base vecteur créée hors du parcours de dépôt : tags de lignée absents
            $pyramidTags = array_filter([
                ...UploadIntegrationWorkflow::forwardedTags($vectordb['tags'] ?? []),
                StoredDataTags::UPLOAD_ID => $vectordb['tags'][StoredDataTags::UPLOAD_ID] ?? null,
                StoredDataTags::PROC_INT_ID => $vectordb['tags'][StoredDataTags::PROC_INT_ID] ?? null,
                StoredDataTags::VECTORDB_ID => $dto->vectordb_id,
                StoredDataTags::PROC_PYR_CREAT_ID => $processingExecution['_id'],
            ], fn ($value) => null !== $value);

            $this->storedDataApiService->addTags($datastoreId, $pyramidId, $pyramidTags)->await();
            $this->processingApiService->launchExecution($datastoreId, $processingExecution['_id'])->await();
        } catch (\Throwable $th) {
            // l’échec de l’annulation est journalisé : l’erreur d’origine reste celle renvoyée ; supprimer l’exécution non lancée supprime sa pyramide (mesuré le 10/11/2026)
            try {
                $this->processingApiService->removeExecution($datastoreId, $processingExecution['_id'])->await();
            } catch (\Throwable $e) {
                $this->logger->warning('{class}: Failed to remove processing execution {executionId} after a failed pyramid generation: {error}', [
                    'class' => self::class,
                    'executionId' => $processingExecution['_id'],
                    'exception' => $e,
                    'error' => $e->getMessage(),
                ]);
            }
            throw $th;
        }

        return new JsonResponse();
    }

    /**
     * Publication TMS depuis le nouveau formulaire : multipart avec le champ JSON `data` (PyramidServiceFormDTO) et les fichiers `thumbnail`, `attribution_logo`.
     */
    #[Route('/{pyramidId}/tms/publish', name: 'tms_publish', methods: ['POST'])]
    public function publish(string $datastoreId, string $pyramidId, Request $request): JsonResponse
    {
        $dto = $this->multipartPayloadMapper->map($request, PyramidServiceFormDTO::class);
        [$thumbnail, $attributionLogo] = $this->serviceFormFileValidator->images($request, 'thumbnail', 'attribution_logo');

        $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId)->array();
        if (StoredDataTypes::ROK4_PYRAMID_VECTOR !== ($pyramid['type'] ?? null)) {
            throw new AppException('La donnée choisie n’est pas une pyramide vecteur', Response::HTTP_BAD_REQUEST);
        }
        $levels = ServiceConfigurationRequestBuilder::getPyramidZoomLevels($pyramid);

        $offering = $this->cartesServiceApiService->publishFromForm(
            $datastoreId,
            $pyramidId,
            $dto,
            ConfigurationTypes::WMTSTMS,
            [
                'title' => $dto->title,
                'abstract' => $dto->description,
                'keywords' => $dto->themes,
                'used_data' => [[
                    'bottom_level' => $levels['bottom_level'],
                    'top_level' => $levels['top_level'],
                    'stored_data' => $pyramidId,
                ]],
            ],
            $thumbnail,
            $attributionLogo,
        );

        return $this->json($offering, Response::HTTP_CREATED);
    }

    #[Route('/{pyramidId}/tms', name: 'tms_add', methods: ['POST'])]
    public function addTms(
        string $datastoreId,
        string $pyramidId,
        #[MapRequestPayload] PyramidVectorTmsServiceDTO $dto,
    ): JsonResponse {
        $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId)->array();

        // TODO Suppression de l'Upload ?
        // TODO Suppression de la base de donnees
        // NOTE on peut difficilement supprimer la base de données parce qu'il y a peut-être d'autres entités qui en dépendent

        // création de requête pour la config
        $typeInfos = $this->getConfigTypeInfos($dto, $pyramid);
        $configRequestBody = ServiceConfigurationRequestBuilder::buildFromCommonDto(ConfigurationTypes::WMTSTMS, $dto, $typeInfos);

        $offering = $this->cartesServiceApiService->saveService($datastoreId, $pyramidId, $dto, ConfigurationTypes::WMTSTMS, $configRequestBody);

        return $this->json($offering);
    }

    #[Route('/{pyramidId}/tms/{offeringId}/edit', name: 'tms_edit', methods: ['POST'])]
    public function editTms(
        string $datastoreId,
        string $pyramidId,
        string $offeringId,
        #[MapRequestPayload] PyramidVectorTmsServiceDTO $dto,
    ): JsonResponse {
        // récup config et offering existants
        $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();
        $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id'])->array();
        $oldOffering['configuration'] = $oldConfiguration;

        $pyramid = $this->storedDataApiService->get($datastoreId, $pyramidId)->array();

        // création de requête pour la config
        $typeInfos = $this->getConfigTypeInfos($dto, $pyramid);
        $configRequestBody = ServiceConfigurationRequestBuilder::buildFromCommonDto(ConfigurationTypes::WMTSTMS, $dto, $typeInfos, $oldConfiguration);

        $offering = $this->cartesServiceApiService->saveService($datastoreId, $pyramidId, $dto, ConfigurationTypes::WMTSTMS, $configRequestBody, $oldOffering);

        return $this->json($offering);
    }

    /**
     * @param array<mixed> $pyramid
     *
     * @return array<mixed>
     */
    private function getConfigTypeInfos(PyramidVectorTmsServiceDTO $dto, array $pyramid): array
    {
        // Recherche de bottom_level et top_level
        $levels = ServiceConfigurationRequestBuilder::getPyramidZoomLevels($pyramid);

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
     *
     * @return list<int>
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
