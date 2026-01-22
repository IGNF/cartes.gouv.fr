<?php

namespace App\Workflow;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ProcessingStatuses;
use App\Constants\EntrepotApi\StoredDataStatuses;
use App\Constants\EntrepotApi\UploadCheckTypes;
use App\Constants\EntrepotApi\UploadStatuses;
use App\Constants\EntrepotApi\UploadTags;
use App\Constants\JobStatuses;
use App\Exception\AppException;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\EntrepotApi\UploadApiService;
use App\Services\SandboxService;
use Symfony\Component\HttpFoundation\JsonResponse;

class UploadIntegrationWorkflow
{
    public function __construct(
        private SandboxService $sandboxService,
        private UploadApiService $uploadApiService,
        private ProcessingApiService $processingApiService,
        private StoredDataApiService $storedDataApiService,
    ) {
    }

    /**
     * @param array<string,string> $progress
     */
    public function getCurrentStepName(array $progress): ?string
    {
        $steps = $this->getStepNames();

        foreach ($steps as $stepName) {
            if (($progress[$stepName] ?? JobStatuses::WAITING) !== JobStatuses::SUCCESSFUL) {
                return $stepName;
            }
        }

        return null;
    }

    /**
     * @param array<string,string> $progress
     */
    public function getCurrentStepIndex(array $progress): int
    {
        $steps = $this->getStepNames();
        foreach ($steps as $index => $stepName) {
            if (($progress[$stepName] ?? JobStatuses::WAITING) !== JobStatuses::SUCCESSFUL) {
                return $index;
            }
        }

        return count($steps);
    }

    /**
     * @param array<string,string> $progress
     */
    public function isIntegrationCompleted(array $progress): bool
    {
        $steps = $this->getStepNames();
        foreach ($steps as $stepName) {
            if (($progress[$stepName] ?? JobStatuses::WAITING) !== JobStatuses::SUCCESSFUL) {
                return false;
            }
        }

        return true;
    }

    /**
     * Exécute au plus une étape à effets de bord (side-effectful), uniquement si c'est l'étape courante et qu'elle est encore en attente.
     *
     * @param array<mixed>         $upload
     * @param array<string,string> $progress
     */
    public function advanceIfPossible(string $datastoreId, array $upload, array $progress): void
    {
        $currentStepName = $this->getCurrentStepName($progress);
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
                $this->launchIntegrationProcessing($datastoreId, $upload);

                return;
        }
    }

    /**
     * @param array<mixed> $upload
     *
     * @return array<string,string>
     */
    public function computeProgress(string $datastoreId, array $upload): array
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
     * @param array<mixed> $upload
     */
    private function launchIntegrationProcessing(string $datastoreId, array $upload): void
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

        $processing = $this->sandboxService->getProcIntegrateVectorFilesInBase($datastoreId);

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

    /**
     * @return string[]
     */
    private function getStepNames(): array
    {
        return [
            UploadTags::INT_STEP_SEND_FILES_API,
            UploadTags::INT_STEP_WAIT_CHECKS,
            UploadTags::INT_STEP_PROCESSING,
        ];
    }
}
