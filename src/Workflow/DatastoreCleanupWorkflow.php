<?php

namespace App\Workflow;

use App\ApiClient\PaginatedResponse;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\ProcessingStatuses;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\MetadataApiService;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StaticApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\EntrepotApi\UploadApiService;

class DatastoreCleanupWorkflow
{
    private const BATCH_SIZE = 10;

    public const ENTITY_OFFERINGS = 'offerings';
    public const ENTITY_CONFIGURATIONS = 'configurations';
    public const ENTITY_ANNEXES = 'annexes';
    public const ENTITY_METADATA = 'metadata';
    public const ENTITY_PROCESSING_EXECUTIONS = 'processing_executions';
    public const ENTITY_STATICS = 'statics';
    public const ENTITY_STORED_DATA = 'stored_data';
    public const ENTITY_UPLOADS = 'uploads';

    /**
     * @var list<string>
     */
    private const PROCESSING_STOPPABLE_STATUSES = [
        ProcessingStatuses::WAITING,
        ProcessingStatuses::PROGRESS,
    ];

    public function __construct(
        private ProcessingApiService $processingApiService,
        private ConfigurationApiService $configurationApiService,
        private CartesServiceApiService $cartesServiceApiService,
        private MetadataApiService $metadataApiService,
        private StaticApiService $staticApiService,
        private AnnexeApiService $annexeApiService,
        private UploadApiService $uploadApiService,
        private StoredDataApiService $storedDataApiService,
    ) {
    }

    public function count(string $datastoreId): array
    {
        $query = [
            'limit' => 1,
            'page' => 1,
        ];

        $procExecWaitingPromise = $this->processingApiService->api->get("datastores/$datastoreId/processings/executions", [
            'status' => ProcessingStatuses::WAITING,
            ...$query,
        ]);
        $procExecProgressPromise = $this->processingApiService->api->get("datastores/$datastoreId/processings/executions", [
            'status' => ProcessingStatuses::PROGRESS,
            ...$query,
        ]);

        $offeringsPromise = $this->configurationApiService->api->get("datastores/$datastoreId/offerings", $query);
        $configurationsPromise = $this->configurationApiService->api->get("datastores/$datastoreId/configurations", $query);
        $metadataPromise = $this->metadataApiService->api->get("datastores/$datastoreId/metadata", $query);
        $staticsPromise = $this->staticApiService->api->get("datastores/$datastoreId/statics", $query);
        $annexesPromise = $this->annexeApiService->api->get("datastores/$datastoreId/annexes", $query);
        $storedDataPromise = $this->storedDataApiService->api->get("datastores/$datastoreId/stored_data", $query);
        $uploadsPromise = $this->uploadApiService->api->get("datastores/$datastoreId/uploads", $query);

        $procExecCount = $this->extractTotalFromPage($procExecWaitingPromise->arrayWithHeaders()) + $this->extractTotalFromPage($procExecProgressPromise->arrayWithHeaders());
        $offeringsCount = $this->extractTotalFromPage($offeringsPromise->arrayWithHeaders());
        $configurationsCount = $this->extractTotalFromPage($configurationsPromise->arrayWithHeaders());
        $metadataCount = $this->extractTotalFromPage($metadataPromise->arrayWithHeaders());
        $staticsCount = $this->extractTotalFromPage($staticsPromise->arrayWithHeaders());
        $annexesCount = $this->extractTotalFromPage($annexesPromise->arrayWithHeaders());
        $storedDataCount = $this->extractTotalFromPage($storedDataPromise->arrayWithHeaders());
        $uploadsCount = $this->extractTotalFromPage($uploadsPromise->arrayWithHeaders());

        return [
            self::ENTITY_PROCESSING_EXECUTIONS => $procExecCount,
            self::ENTITY_OFFERINGS => $offeringsCount,
            self::ENTITY_CONFIGURATIONS => $configurationsCount,
            self::ENTITY_METADATA => $metadataCount,
            self::ENTITY_STATICS => $staticsCount,
            self::ENTITY_ANNEXES => $annexesCount,
            self::ENTITY_STORED_DATA => $storedDataCount,
            self::ENTITY_UPLOADS => $uploadsCount,
        ];
    }

    /**
     * @param callable(string, array{entities: array<string, int>}): void $emitProgress
     * @param callable(): bool                                            $shouldStop
     * @param array<string,int>                                           $counts
     *
     * @return array<string,int>
     */
    public function deleteSequentially(string $datastoreId, callable $emitProgress, callable $shouldStop, ?array $counts = null): array
    {
        $counts ??= $this->count($datastoreId);

        if ($shouldStop()) {
            return $counts;
        }

        foreach ($this->getEntityTypes() as $entityType) {
            if ($shouldStop()) {
                return $counts;
            }

            $emitProgress('progress', ['entities' => $counts]);

            if (self::ENTITY_PROCESSING_EXECUTIONS === $entityType) {
                foreach (self::PROCESSING_STOPPABLE_STATUSES as $status) {
                    $this->iterateEntityTypeSequentially(
                        $datastoreId,
                        $entityType,
                        $counts,
                        $emitProgress,
                        $shouldStop,
                        $status
                    );
                }

                continue;
            }

            $this->iterateEntityTypeSequentially($datastoreId, $entityType, $counts, $emitProgress, $shouldStop);
        }

        return $counts;
    }

    /**
     * @return list<string>
     */
    private function getEntityTypes(): array
    {
        return [
            self::ENTITY_PROCESSING_EXECUTIONS,
            self::ENTITY_OFFERINGS,
            self::ENTITY_CONFIGURATIONS,
            self::ENTITY_METADATA,
            self::ENTITY_STATICS,
            self::ENTITY_ANNEXES,
            self::ENTITY_STORED_DATA,
            self::ENTITY_UPLOADS,
        ];
    }

    /**
     * @param array<string, int>                                          $counts
     * @param callable(string, array{entities: array<string, int>}): void $emitProgress
     */
    private function iterateEntityTypeSequentially(
        string $datastoreId,
        string $entityType,
        array &$counts,
        callable $emitProgress,
        callable $shouldStop,
        ?string $processingStatus = null,
    ): void {
        $page = 1;

        while (true) {
            $list = $this->getEntityListPage($datastoreId, $entityType, $page, self::BATCH_SIZE, $processingStatus);
            if ([] === $list->content) {
                return;
            }

            foreach ($list->content as $item) {
                if ($shouldStop()) {
                    return;
                }

                $id = (string) ($item['_id'] ?? '');
                if ('' === $id) {
                    continue;
                }

                try {
                    $deleted = $this->deleteOneSequentially(
                        $datastoreId,
                        $entityType,
                        $item,
                    );
                } catch (\Throwable $exception) {
                    throw new \RuntimeException(sprintf("Echec de suppression de %s (%s) de l'entrepôt %s", $entityType, $id, $datastoreId), 0, $exception);
                }

                if (true === $deleted) {
                    $counts[$entityType] = max(0, ($counts[$entityType] ?? 0) - 1);
                    $emitProgress('progress', ['entities' => $counts]);
                }
            }
        }
    }

    /**
     * @param array<string, mixed> $item
     */
    private function deleteOneSequentially(
        string $datastoreId,
        string $entityType,
        array $item,
    ): bool {
        // Retourner true uniquement si l'item est effectivement supprimé/arrêté.
        // Retourner false si l'item est ignoré ou non supprimé.
        // Lever une exception en cas d'erreur bloquante.

        switch ($entityType) {
            case self::ENTITY_PROCESSING_EXECUTIONS:
                $this->processingApiService->abortExecution($datastoreId, $item['_id'])->await();

                return true;

            case self::ENTITY_OFFERINGS:
                $this->cartesServiceApiService->unpublish($datastoreId, $item['_id']);

                return true;

            case self::ENTITY_CONFIGURATIONS:
                if (ConfigurationStatuses::UNPUBLISHED === $item['status']) {
                    $this->configurationApiService->remove($datastoreId, $item['_id']);

                    return true;
                }

                return false;

            case self::ENTITY_METADATA:
                $endpointId = $item['endpoints'][0]['_id'] ?? null;
                if (null !== $endpointId) {
                    $this->metadataApiService->unpublish($datastoreId, $item['file_identifier'], $endpointId)->await();
                }

                $this->metadataApiService->delete($datastoreId, $item['_id'])->await();

                return true;

            case self::ENTITY_STATICS:
                $this->staticApiService->delete($datastoreId, $item['_id'])->await();

                return true;

            case self::ENTITY_ANNEXES:
                $this->annexeApiService->remove($datastoreId, $item['_id'])->await();

                return true;

            case self::ENTITY_STORED_DATA:
                $this->storedDataApiService->remove($datastoreId, $item['_id'])->await();

                return true;

            case self::ENTITY_UPLOADS:
                $this->uploadApiService->remove($datastoreId, $item['_id'])->await();

                return true;

            default:
                throw new \InvalidArgumentException(sprintf('Type de données non supportées: %s', $entityType));
        }
    }

    private function extractTotalFromPage(PaginatedResponse $page): int
    {
        $contentRange = $page->getContentRange();
        if (null === $contentRange || !str_contains($contentRange, '/')) {
            return count($page->content);
        }

        $parts = explode('/', $contentRange);
        $total = $parts[1] ?? null;
        if (null === $total || !is_numeric($total)) {
            return count($page->content);
        }

        return (int) $total;
    }

    private function getEntityListPage(
        string $datastoreId,
        string $entityType,
        int $page,
        int $limit,
        ?string $processingStatus = null,
    ): PaginatedResponse {
        $query = [
            'page' => $page,
            'limit' => $limit,
        ];

        switch ($entityType) {
            case self::ENTITY_PROCESSING_EXECUTIONS:
                return $this->processingApiService->getExecutionList($datastoreId, [
                    ...$query,
                    'status' => $processingStatus,
                ]);

            case self::ENTITY_OFFERINGS:
                return $this->configurationApiService->getOfferingsList($datastoreId, $query);

            case self::ENTITY_CONFIGURATIONS:
                return $this->configurationApiService->getList($datastoreId, $query);

            case self::ENTITY_METADATA:
                return $this->metadataApiService->getList($datastoreId, $query);

            case self::ENTITY_STATICS:
                return $this->staticApiService->getList($datastoreId, $query);

            case self::ENTITY_ANNEXES:
                return $this->annexeApiService->getList($datastoreId, $query);

            case self::ENTITY_UPLOADS:
                return $this->uploadApiService->getList($datastoreId, $query);

            case self::ENTITY_STORED_DATA:
                return $this->storedDataApiService->getList($datastoreId, $query);

            default:
                throw new \InvalidArgumentException(sprintf('Type d\'entité non supporté: %s', $entityType));
        }
    }
}
