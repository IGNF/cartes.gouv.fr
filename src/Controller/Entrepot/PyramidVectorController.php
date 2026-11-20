<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\StoredDataTags;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\PyramidVector\PyramidVectorCompositionDTO;
use App\Dto\Services\PyramidVector\PyramidVectorGenerateDTO;
use App\Security\User;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\SandboxService;
use App\Workflow\UploadIntegrationWorkflow;
use OpenApi\Attributes as OA;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[Route(
    '/api/datastores/{datastoreId}/pyramid-vector',
    name: 'cartesgouvfr_api_pyramid_vector_',
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] pyramid-vector', description: 'Génération de pyramides de tuiles vectorielles')]
final class PyramidVectorController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly StoredDataApiService $storedDataApiService,
        private readonly ProcessingApiService $processingApiService,
        private readonly SandboxService $sandboxService,
        private readonly UrlGeneratorInterface $urlGenerator,
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
