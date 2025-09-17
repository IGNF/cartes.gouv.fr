<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\ProcessingStatuses;

class CartesStoredDataApiService
{
    public function __construct(
        private StoredDataApiService $storedDataApiService,
        private ProcessingApiService $processingApiService,
        private ConfigurationApiService $configurationApiService,
        private CartesServiceApiService $cartesServiceApiService,
    ) {
    }

    /**
     * Suppression d'une donnée stockée en s'assurant qu'elle n'est pas utilisée par des configurations ou des traitements en cours.
     */
    public function delete(string $datastoreId, string $storedDataId): void
    {
        // Suppression des offerings et configurations associées
        $offerings = $this->configurationApiService->getAllOfferings($datastoreId, ['stored_data' => $storedDataId]);
        foreach ($offerings as $offering) {
            $this->cartesServiceApiService->unpublish($datastoreId, $offering['_id']);
        }

        // Annulation des exécutions de traitements en cours utilisant la donnée stockée en entrée
        $blockingProcessingStatuses = [ProcessingStatuses::CREATED, ProcessingStatuses::WAITING, ProcessingStatuses::PROGRESS];
        $processingExecutions = $this->processingApiService->getAllExecutions($datastoreId, [
            'input_stored_data' => $storedDataId,
        ]);
        foreach ($processingExecutions as &$procExec) {
            if (in_array($procExec['status'], $blockingProcessingStatuses)) {
                $this->processingApiService->abortExecution($datastoreId, $procExec['_id']);

                $procExec = $this->processingApiService->getExecution($datastoreId, $procExec['_id']);
                $this->storedDataApiService->remove($datastoreId, $procExec['output']['stored_data']['_id']); // suppression de la donnée stockée créée par le traitement
            }
        }

        // Annulation des exécutions de traitements en cours créant la donnée stockée
        $processingExecutions = $this->processingApiService->getAllExecutions($datastoreId, [
            'output_stored_data' => $storedDataId,
        ]);
        foreach ($processingExecutions as &$procExec) {
            if (in_array($procExec['status'], $blockingProcessingStatuses)) {
                $this->processingApiService->abortExecution($datastoreId, $procExec['_id']);
            }
        }

        // Suppression de la donnée stockée
        $this->storedDataApiService->remove($datastoreId, $storedDataId);
    }
}
