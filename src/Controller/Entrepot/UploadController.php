<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ProcessingStatuses;
use App\Constants\EntrepotApi\StoredDataStatuses;
use App\Constants\EntrepotApi\UploadCheckTypes;
use App\Constants\EntrepotApi\UploadStatuses;
use App\Constants\EntrepotApi\UploadTags;
use App\Constants\EntrepotApi\UploadTypes;
use App\Constants\JobStatuses;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\EntrepotApi\UploadApiService;
use App\Services\SandboxService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/upload',
    name: 'cartesgouvfr_api_upload_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[entrepot] upload')]
class UploadController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private UploadApiService $uploadApiService,
        private SandboxService $datastoreService,
        private ProcessingApiService $processingApiService,
        private StoredDataApiService $storedDataApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getUploadList(
        string $datastoreId,
        #[MapQueryParameter] ?string $type = null,
    ): JsonResponse {
        try {
            $query = [];
            if (null !== $type) {
                $query['type'] = $type;
            }

            $uploadList = $this->uploadApiService->getAllDetailed($datastoreId, $query);

            return $this->json($uploadList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $content = json_decode($request->getContent(), true);

            // déclaration de livraison
            $uploadData = [
                'name' => $content['data_technical_name'],
                'description' => $content['data_technical_name'],
                'type' => UploadTypes::VECTOR,
                'srs' => $content['data_srid'],
            ];
            $upload = $this->uploadApiService->add($datastoreId, $uploadData);

            // ajout tags sur la livraison
            $tags = [
                UploadTags::DATA_UPLOAD_PATH => $content['data_upload_path'],
                CommonTags::DATASHEET_NAME => $content['data_name'],
                CommonTags::PRODUCER => $content['producer'],
                CommonTags::PRODUCTION_YEAR => $content['production_year'],
            ];
            $upload = $this->uploadApiService->addTags($datastoreId, $upload['_id'], $tags);

            // retourne l'upload au frontend, qui se chargera de lancer l'intégration VECTOR-DB
            return $this->json($upload);
        } catch (AppException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], $ex->getCode());
        }
    }

    #[Route('/{uploadId}', name: 'get', methods: ['GET'])]
    public function get(string $datastoreId, string $uploadId): JsonResponse
    {
        try {
            return $this->json($this->uploadApiService->get($datastoreId, $uploadId));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{uploadId}/file_tree', name: 'get_file_tree', methods: ['GET'])]
    public function getFileTree(string $datastoreId, string $uploadId): JsonResponse
    {
        try {
            $fileTree = $this->uploadApiService->getFileTree($datastoreId, $uploadId);

            return $this->json($fileTree);
        } catch (AppException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], $ex->getCode());
        }
    }

    #[Route('/{uploadId}/integration_progress', name: 'integration_progress', methods: ['GET'])]
    public function integrationProgress(
        string $datastoreId,
        string $uploadId,
        #[MapQueryParameter] bool $getOnlyProgress = false,
    ): JsonResponse {
        try {
            $upload = $this->uploadApiService->get($datastoreId, $uploadId);
            $progress = $this->computeIntegrationProgress($datastoreId, $upload);

            if (false === $getOnlyProgress) {
                $this->advanceIntegrationIfPossible($datastoreId, $upload, $progress);

                $upload = $this->uploadApiService->get($datastoreId, $uploadId);
                $progress = $this->computeIntegrationProgress($datastoreId, $upload);
            }

            $currentStepIndex = $this->getIntegrationCurrentStepIndexFromProgress($progress);

            $progressJson = json_encode($progress);
            $stepString = (string) $currentStepIndex;
            $existingProgressJson = $upload['tags'][UploadTags::INTEGRATION_PROGRESS] ?? null;
            $existingStepString = isset($upload['tags'][UploadTags::INTEGRATION_CURRENT_STEP]) ? (string) $upload['tags'][UploadTags::INTEGRATION_CURRENT_STEP] : null;

            $uploadTags = [
                UploadTags::INTEGRATION_PROGRESS => $progressJson,
                UploadTags::INTEGRATION_CURRENT_STEP => $stepString,
            ];

            // mise à jour état des étapes de l'intégration uniquement si changement
            if ($existingProgressJson !== $progressJson || $existingStepString !== $stepString) {
                $this->uploadApiService->addTags($datastoreId, $uploadId, $uploadTags);
            }

            return $this->json($uploadTags);
        } catch (ApiException|AppException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @return list<string>
     */
    private function getIntegrationStepNames(): array
    {
        return [
            UploadTags::INT_STEP_SEND_FILES_API,
            UploadTags::INT_STEP_WAIT_CHECKS,
            UploadTags::INT_STEP_PROCESSING,
        ];
    }

    /**
     * @param array<mixed> $upload
     *
     * @return array<string,string>
     */
    private function computeIntegrationProgress(string $datastoreId, array $upload): array
    {
        $progress = [
            UploadTags::INT_STEP_SEND_FILES_API => JobStatuses::WAITING,
            UploadTags::INT_STEP_WAIT_CHECKS => JobStatuses::WAITING,
            UploadTags::INT_STEP_PROCESSING => JobStatuses::WAITING,
        ];

        $sendFilesStatus = $this->computeSendFilesStatus($upload);
        $progress[UploadTags::INT_STEP_SEND_FILES_API] = $sendFilesStatus;
        if (JobStatuses::SUCCESSFUL !== $sendFilesStatus) {
            return $progress;
        }

        $waitChecksStatus = $this->computeWaitChecksStatus($datastoreId, $upload);
        $progress[UploadTags::INT_STEP_WAIT_CHECKS] = $waitChecksStatus;
        if (JobStatuses::SUCCESSFUL !== $waitChecksStatus) {
            return $progress;
        }

        $processingStatus = $this->computeProcessingStatus($datastoreId, $upload);
        $progress[UploadTags::INT_STEP_PROCESSING] = $processingStatus;

        return $progress;
    }

    /**
     * L'étape est considérée comme (sachant qu'un upload est OPEN à sa création) :
     * - SUCCESSFUL : si le statut de l'upload est CLOSED ou CHECKING
     * - WAITING : si le statut de l'upload est OPEN
     * - FAILED : dans les autres cas
     *
     * @param array<mixed> $upload
     */
    private function computeSendFilesStatus(array $upload): string
    {
        if (in_array($upload['status'], [UploadStatuses::CLOSED, UploadStatuses::CHECKING], true)) {
            return JobStatuses::SUCCESSFUL;
        }

        if (UploadStatuses::OPEN === $upload['status']) {
            return JobStatuses::WAITING;
        }

        return JobStatuses::FAILED;
    }

    /**
     * L'étape est considérée comme :
     * - FAILED : si au moins un check est à FAILED
     * - IN_PROGRESS : si au moins un check est à ASKED ou IN_PROGRESS ou si l'upload est en CHECKING
     * - SUCCESSFUL : si au moins un check est à PASSED et aucun à FAILED
     * - WAITING : si aucun check n'est encore lancé (upload pas en CHECKING)
     *
     * @param array<mixed> $upload
     */
    private function computeWaitChecksStatus(string $datastoreId, array $upload): string
    {
        $uploadChecks = $this->uploadApiService->getCheckExecutions($datastoreId, $upload['_id']);

        $askedCount = count($uploadChecks[UploadCheckTypes::ASKED] ?? []);
        $inProgressCount = count($uploadChecks[UploadCheckTypes::IN_PROGRESS] ?? []);
        $failedCount = count($uploadChecks[UploadCheckTypes::FAILED] ?? []);
        $passedCount = count($uploadChecks[UploadCheckTypes::PASSED] ?? []);

        if ($failedCount > 0) {
            return JobStatuses::FAILED;
        }

        if ($askedCount > 0 || $inProgressCount > 0) {
            return JobStatuses::IN_PROGRESS;
        }

        if ($passedCount > 0) {
            return JobStatuses::SUCCESSFUL;
        }

        return UploadStatuses::CHECKING === $upload['status'] ? JobStatuses::IN_PROGRESS : JobStatuses::WAITING;
    }

    /**
     * L'étape est considérée comme :
     * - WAITING : si les tags proc_int_id et vectordb_id sont absents
     * - FAILED : si un seul des deux tags est présent
     * - IN_PROGRESS : si l'exécution de processing est en CREATED, WAITING ou PROGRESS
     * - SUCCESSFUL : si l'exécution de processing est en SUCCESS et que la stored_data vectordb est en GENERATED
     * - IN_PROGRESS : si l'exécution de processing est en SUCCESS et que la stored_data vectordb est en CREATED, GENERATING ou MODIFYING
     * - FAILED : dans les autres cas
     *
     * @param array<mixed> $upload
     */
    private function computeProcessingStatus(string $datastoreId, array $upload): string
    {
        $hasProcExecId = isset($upload['tags']['proc_int_id']);
        $hasVectorDbId = isset($upload['tags']['vectordb_id']);

        // Ne devrait pas arriver normalement, mais si c'est le cas, on évite de bloquer l'intégration à l'infini.
        if ($hasProcExecId xor $hasVectorDbId) {
            return JobStatuses::FAILED;
        }

        if (!$hasProcExecId || !$hasVectorDbId) {
            return JobStatuses::WAITING;
        }

        $processingExec = $this->processingApiService->getExecution($datastoreId, $upload['tags']['proc_int_id']);
        $vectordb = $this->storedDataApiService->get($datastoreId, $upload['tags']['vectordb_id']);

        if (in_array($processingExec['status'], [ProcessingStatuses::CREATED, ProcessingStatuses::WAITING, ProcessingStatuses::PROGRESS], true)) {
            return JobStatuses::IN_PROGRESS;
        }

        if (ProcessingStatuses::SUCCESS === $processingExec['status']) {
            if (StoredDataStatuses::GENERATED === $vectordb['status']) {
                return JobStatuses::SUCCESSFUL;
            }
            if (in_array($vectordb['status'], [StoredDataStatuses::CREATED, StoredDataStatuses::GENERATING, StoredDataStatuses::MODIFYING], true)) {
                return JobStatuses::IN_PROGRESS;
            }

            return JobStatuses::FAILED;
        }

        return JobStatuses::FAILED;
    }

    /**
     * @param array<string,string> $progress
     */
    private function getIntegrationCurrentStepNameFromProgress(array $progress): ?string
    {
        foreach ($this->getIntegrationStepNames() as $stepName) {
            if (($progress[$stepName] ?? JobStatuses::WAITING) !== JobStatuses::SUCCESSFUL) {
                return $stepName;
            }
        }

        return null;
    }

    /**
     * @param array<string,string> $progress
     */
    private function getIntegrationCurrentStepIndexFromProgress(array $progress): int
    {
        $steps = $this->getIntegrationStepNames();
        foreach ($steps as $index => $stepName) {
            if (($progress[$stepName] ?? JobStatuses::WAITING) !== JobStatuses::SUCCESSFUL) {
                return $index;
            }
        }

        return count($steps);
    }

    /**
     * Exécute au plus une étape à effets de bord (side-effectful), uniquement si c'est l'étape courante et qu'elle est encore en attente.
     *
     * @param array<mixed>         $upload
     * @param array<string,string> $progress
     */
    private function advanceIntegrationIfPossible(string $datastoreId, array $upload, array $progress): void
    {
        $currentStepName = $this->getIntegrationCurrentStepNameFromProgress($progress);
        if (null === $currentStepName) {
            return;
        }

        $currentStepStatus = $progress[$currentStepName] ?? JobStatuses::WAITING;
        if (JobStatuses::WAITING !== $currentStepStatus) {
            return;
        }

        switch ($currentStepName) {
            case UploadTags::INT_STEP_SEND_FILES_API:
                if (!isset($upload['tags'][UploadTags::DATA_UPLOAD_PATH])) {
                    return;
                }

                $this->uploadApiService->addFile($datastoreId, $upload['_id'], $upload['tags'][UploadTags::DATA_UPLOAD_PATH]);

                return;

            case UploadTags::INT_STEP_PROCESSING:
                $this->launchProcessingIntegration($datastoreId, $upload);

                return;
        }
    }

    /**
     * @param array<mixed> $upload
     */
    private function launchProcessingIntegration(string $datastoreId, array $upload): void
    {
        $hasProcExecId = isset($upload['tags']['proc_int_id']);
        $hasVectorDbId = isset($upload['tags']['vectordb_id']);

        // ne devrait pas arriver normalement, juste un garde fou
        if ($hasProcExecId || $hasVectorDbId) {
            return;
        }

        if (!isset($upload['tags'][CommonTags::DATASHEET_NAME])) {
            throw new AppException('Missing datasheet_name tag on upload', JsonResponse::HTTP_BAD_REQUEST, ['message' => 'Missing required tag: datasheet_name']);
        }

        $processing = $this->datastoreService->getProcIntegrateVectorFilesInBase($datastoreId);

        $procExecBody = [
            'processing' => $processing,
            'inputs' => [
                'upload' => [$upload['_id']],
            ],
            'output' => [
                'stored_data' => [
                    'name' => $upload['name'],
                    'storage_tags' => ['VECTEUR'], // TODO : choisir VECTEUR ou RASTER en fonction du type de upload
                ],
            ],
        ];

        $processingExec = $this->processingApiService->addExecution($datastoreId, $procExecBody);
        $vectorDb = $processingExec['output']['stored_data'];

        // ajout tags sur l'upload
        $this->uploadApiService->addTags($datastoreId, $upload['_id'], [
            'vectordb_id' => $vectorDb['_id'],
            'proc_int_id' => $processingExec['_id'],
        ]);

        // ajout tags sur la stored_data
        $tags = [
            'upload_id' => $upload['_id'],
            'proc_int_id' => $processingExec['_id'],
            CommonTags::DATASHEET_NAME => $upload['tags'][CommonTags::DATASHEET_NAME],
        ];
        if (isset($upload['tags'][CommonTags::PRODUCER])) {
            $tags[CommonTags::PRODUCER] = $upload['tags'][CommonTags::PRODUCER];
        }
        if (isset($upload['tags'][CommonTags::PRODUCTION_YEAR])) {
            $tags[CommonTags::PRODUCTION_YEAR] = $upload['tags'][CommonTags::PRODUCTION_YEAR];
        }
        $this->storedDataApiService->addTags($datastoreId, $vectorDb['_id'], $tags);

        $this->processingApiService->launchExecution($datastoreId, $processingExec['_id']);
    }

    #[Route('/{uploadId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $uploadId): JsonResponse
    {
        try {
            $this->uploadApiService->remove($datastoreId, $uploadId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{uploadId}/upload-report', name: 'get_upload_report', methods: ['GET'])]
    public function getUploadReport(string $datastoreId, string $uploadId): JsonResponse
    {
        try {
            // Récupération des détails de l'upload ayant échoué
            $inputUpload = $this->uploadApiService->get($datastoreId, $uploadId);
            $inputUpload['file_tree'] = $this->uploadApiService->getFileTree($datastoreId, $inputUpload['_id']);
            $inputUpload['checks'] = [];
            $uploadChecks = $this->uploadApiService->getCheckExecutions($datastoreId, $inputUpload['_id']);

            foreach ($uploadChecks as &$checkType) {
                foreach ($checkType as &$checkExecution) {
                    $checkExecution = array_merge($checkExecution, $this->uploadApiService->getCheckExecution($datastoreId, $checkExecution['_id']));
                    try {
                        $checkExecution['logs'] = $this->uploadApiService->getCheckExecutionLogs($datastoreId, $checkExecution['_id']);
                    } catch (ApiException $ex) {
                    }
                    $inputUpload['checks'][] = $checkExecution;
                }
            }

            return $this->json([
                'input_upload' => $inputUpload,
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }
}
