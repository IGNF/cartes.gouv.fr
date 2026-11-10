<?php

namespace App\Workflow;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ProcessingStatuses;
use App\Constants\EntrepotApi\StoredDataStatuses;
use App\Constants\EntrepotApi\UploadCheckTypes;
use App\Constants\EntrepotApi\UploadStatuses;
use App\Constants\EntrepotApi\UploadTags;
use App\Constants\JobStatuses;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Security\User;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\EntrepotApi\UploadApiService;
use App\Services\SandboxService;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\AutowireServiceClosure;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Lock\Exception\ExceptionInterface as LockException;
use Symfony\Component\Lock\LockFactory;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class UploadIntegrationWorkflow
{
    public const STEP_SEND_FILES_API = 'send_files_api';
    public const STEP_WAIT_CHECKS = 'wait_checks';
    public const STEP_PROCESSING = 'integration_processing';

    public const ACTION_SEND_FILES = 'send_files';
    public const ACTION_LAUNCH_PROCESSING = 'launch_processing';
    public const ACTION_DELETE_UPLOAD = 'delete_upload';

    /**
     * @param \Closure(): LockFactory $lockFactory résolu à l'usage : la lecture de l'état ne dépend pas du stockage des verrous
     */
    public function __construct(
        private readonly SandboxService $sandboxService,
        private readonly UploadApiService $uploadApiService,
        private readonly ProcessingApiService $processingApiService,
        private readonly StoredDataApiService $storedDataApiService,
        private readonly Security $security,
        private readonly UrlGeneratorInterface $urlGenerator,
        #[AutowireServiceClosure('lock.factory')]
        private readonly \Closure $lockFactory,
    ) {
    }

    /**
     * État de l'intégration, calculé à chaque lecture, sans effet de bord.
     *
     * @param array<mixed> $upload
     *
     * @return array{steps: array<string,string>, status: string, next_action: ?string, vectordb_id: ?string, datasheet_name: ?string}
     */
    public function getState(string $datastoreId, array $upload): array
    {
        $steps = [
            self::STEP_SEND_FILES_API => JobStatuses::WAITING,
            self::STEP_WAIT_CHECKS => JobStatuses::WAITING,
            self::STEP_PROCESSING => JobStatuses::WAITING,
        ];

        // une étape n'est calculée que si la précédente a réussi
        $steps[self::STEP_SEND_FILES_API] = $this->computeSendFilesStatus($upload);
        if (JobStatuses::SUCCESSFUL === $steps[self::STEP_SEND_FILES_API]) {
            $steps[self::STEP_WAIT_CHECKS] = $this->computeWaitChecksStatus($datastoreId, $upload);
        }
        if (JobStatuses::SUCCESSFUL === $steps[self::STEP_WAIT_CHECKS]) {
            $steps[self::STEP_PROCESSING] = $this->computeProcessingStatus($datastoreId, $upload);
        }

        // statut global : celui de la première étape non réussie
        $status = JobStatuses::SUCCESSFUL;
        foreach ($steps as $stepStatus) {
            if (JobStatuses::SUCCESSFUL !== $stepStatus) {
                $status = $stepStatus;
                break;
            }
        }

        $nextAction = null;
        if (JobStatuses::WAITING === $steps[self::STEP_SEND_FILES_API]) {
            $nextAction = self::ACTION_SEND_FILES;
        } elseif (JobStatuses::SUCCESSFUL === $steps[self::STEP_WAIT_CHECKS] && JobStatuses::WAITING === $steps[self::STEP_PROCESSING]) {
            $nextAction = self::ACTION_LAUNCH_PROCESSING;
        } elseif (JobStatuses::SUCCESSFUL === $status) {
            $nextAction = self::ACTION_DELETE_UPLOAD;
        }

        return [
            'steps' => $steps,
            'status' => $status,
            'next_action' => $nextAction,
            'vectordb_id' => $upload['tags']['vectordb_id'] ?? null,
            'datasheet_name' => $upload['tags'][CommonTags::DATASHEET_NAME] ?? null,
        ];
    }

    /**
     * Exécute la prochaine action en attente, sous verrou : un second appel simultané n'exécute rien.
     *
     * @return array{steps: array<string,string>, status: string, next_action: ?string, vectordb_id: ?string, datasheet_name: ?string}
     *
     * @throws AppException 503 si le verrou ne peut pas être pris (stockage indisponible)
     */
    public function advance(string $datastoreId, string $uploadId): array
    {
        // avant le verrou : un identifiant inconnu répond 404 sans laisser de fichier verrou
        $this->uploadApiService->get($datastoreId, $uploadId)->array();

        try {
            $lock = ($this->lockFactory)()->createLock("upload_integration_$uploadId");
            $acquired = $lock->acquire();
        } catch (LockException $e) {
            throw new AppException('Le stockage des fichiers est indisponible, réessayez plus tard', JsonResponse::HTTP_SERVICE_UNAVAILABLE, previous: $e);
        }

        if (!$acquired) {
            return $this->getState($datastoreId, $this->uploadApiService->get($datastoreId, $uploadId)->array());
        }

        try {
            $upload = $this->uploadApiService->get($datastoreId, $uploadId)->array();
            $state = $this->getState($datastoreId, $upload);

            switch ($state['next_action']) {
                case self::ACTION_SEND_FILES:
                    if (!isset($upload['tags'][UploadTags::DATA_UPLOAD_PATH])) {
                        throw new AppException('Missing data_upload_path tag on upload', JsonResponse::HTTP_INTERNAL_SERVER_ERROR, ['message' => 'Missing required tag: data_upload_path']);
                    }
                    $this->uploadApiService->addFile($datastoreId, $uploadId, $upload['tags'][UploadTags::DATA_UPLOAD_PATH]);
                    break;

                case self::ACTION_LAUNCH_PROCESSING:
                    $this->launchIntegrationProcessing($datastoreId, $upload);
                    break;

                case self::ACTION_DELETE_UPLOAD:
                    try {
                        $this->uploadApiService->remove($datastoreId, $uploadId, $upload)->await();
                    } catch (ApiException) {
                        // l'intégration a réussi : une suppression en échec sera retentée au prochain passage
                    }

                    return ['next_action' => null] + $state;

                default:
                    return $state;
            }

            return $this->getState($datastoreId, $this->uploadApiService->get($datastoreId, $uploadId)->array());
        } finally {
            $lock->release();
        }
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
        if (!in_array($upload['status'], [UploadStatuses::CLOSED, UploadStatuses::CHECKING], true)) {
            return JobStatuses::WAITING;
        }

        $uploadChecks = $this->uploadApiService->getCheckExecutions($datastoreId, $upload['_id'])->array();

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
     * - IN_PROGRESS : si l'exécution de processing est en SUCCESS et que la stored_data vectordb est encore en CREATED, GENERATING ou MODIFYING
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

        $processingExec = $this->processingApiService->getExecution($datastoreId, $upload['tags']['proc_int_id'])->array();
        $vectordb = $this->storedDataApiService->get($datastoreId, $upload['tags']['vectordb_id'])->array();

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
        if (!isset($upload['tags'][CommonTags::DATASHEET_NAME])) {
            throw new AppException('Missing datasheet_name tag on upload', JsonResponse::HTTP_INTERNAL_SERVER_ERROR, ['message' => 'Missing required tag: datasheet_name']);
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

        if (isset($upload['tags'][CommonTags::EMAIL_NOTIFICATION]) && filter_var($upload['tags'][CommonTags::EMAIL_NOTIFICATION], FILTER_VALIDATE_BOOLEAN)) {
            /** @var User|null */
            $user = $this->security->getUser();
            $userEmail = $user?->getEmail();
            $datasheetName = $upload['tags'][CommonTags::DATASHEET_NAME] ?? null;

            if ($userEmail && $datasheetName) {
                $baseUrl = $this->urlGenerator->generate('cartesgouvfr_app', [], UrlGeneratorInterface::ABSOLUTE_URL);

                $procExecBody['callback'] = [
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

        $processingExec = $this->processingApiService->addExecution($datastoreId, $procExecBody)->array();
        $vectorDbId = $processingExec['output']['stored_data']['_id'];

        try {
            $this->uploadApiService->addTags($datastoreId, $upload['_id'], [
                'vectordb_id' => $vectorDbId,
                'proc_int_id' => $processingExec['_id'],
            ])->await();

            $this->storedDataApiService->addTags($datastoreId, $vectorDbId, [
                'upload_id' => $upload['_id'],
                'proc_int_id' => $processingExec['_id'],
                ...self::forwardedTags($upload['tags']),
            ])->await();

            $this->processingApiService->launchExecution($datastoreId, $processingExec['_id'])->await();
        } catch (\Throwable $e) {
            $this->cancelLaunch($datastoreId, $upload['_id'], $processingExec['_id']);

            throw $e;
        }
    }

    /**
     * Défait un lancement interrompu : sans cela la livraison pointerait vers un traitement jamais lancé.
     */
    private function cancelLaunch(string $datastoreId, string $uploadId, string $executionId): void
    {
        // au mieux : l'erreur d'origine est celle qui remonte
        try {
            // supprimer l'exécution non lancée supprime aussi sa donnée stockée de sortie (mesuré le 10/11/2026)
            $this->processingApiService->removeExecution($datastoreId, $executionId)->await();
        } catch (ApiException) {
            // suppression refusée : l'exécution a pu démarrer, les tags restent pour que l'état la suive
            return;
        }

        try {
            $this->uploadApiService->removeTags($datastoreId, $uploadId, ['vectordb_id', 'proc_int_id'])->await();
        } catch (ApiException) {
        }
    }

    /**
     * Tags métier de la livraison recopiés sur la donnée stockée.
     *
     * @param array<string, mixed> $uploadTags
     *
     * @return array<string, mixed>
     */
    public static function forwardedTags(array $uploadTags): array
    {
        return array_intersect_key($uploadTags, array_flip([
            CommonTags::DATASHEET_NAME,
            CommonTags::PRODUCER,
            CommonTags::PRODUCER_SHORT,
            CommonTags::PRODUCTION_YEAR,
            CommonTags::PRODUCTION_DATE,
            CommonTags::THEME_CATEGORIES,
            CommonTags::ZONE,
        ]));
    }
}
