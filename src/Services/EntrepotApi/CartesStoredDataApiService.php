<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\ProcessingStatuses;
use App\Exception\ApiException;
use Symfony\Component\HttpFoundation\Response;

class CartesStoredDataApiService
{
    public function __construct(
        private readonly StoredDataApiService $storedDataApiService,
        private readonly ProcessingApiService $processingApiService,
        private readonly ConfigurationApiService $configurationApiService,
        private readonly CartesServiceApiService $cartesServiceApiService,
        private readonly AnnexeApiService $annexeApiService,
    ) {
    }

    /**
     * Suppression d'une donnée stockée en s'assurant qu'elle n'est pas utilisée par des configurations ou des traitements en cours.
     */
    public function delete(string $datastoreId, string $storedDataId): void
    {
        $storedData = $this->storedDataApiService->get($datastoreId, $storedDataId)->array();

        // Suppression des offerings et configurations associées
        $offerings = $this->configurationApiService->getAllOfferings($datastoreId, ['stored_data' => $storedDataId])->resolve();
        foreach ($offerings as $offering) {
            $this->cartesServiceApiService->unpublish($datastoreId, $offering['_id']);
        }

        // Annulation des exécutions de traitements en cours utilisant la donnée stockée en entrée
        $blockingProcessingStatuses = [ProcessingStatuses::CREATED, ProcessingStatuses::WAITING, ProcessingStatuses::PROGRESS];
        $processingExecutions = $this->processingApiService->getAllExecutions($datastoreId, [
            'input_stored_data' => $storedDataId,
        ])->resolve();
        foreach ($processingExecutions as $procExec) {
            if (in_array($procExec['status'], $blockingProcessingStatuses)) {
                $this->abortExecution($datastoreId, $procExec['_id']);

                $procExec = $this->processingApiService->getExecution($datastoreId, $procExec['_id'])->array();
                // traitement réussi entre la liste et l’annulation : sa donnée de sortie est une vraie donnée, on la garde
                if (ProcessingStatuses::SUCCESS !== $procExec['status']) {
                    $this->storedDataApiService->remove($datastoreId, $procExec['output']['stored_data']['_id'])->await(); // suppression de la donnée stockée créée par le traitement
                }
            }
        }

        // Annulation des exécutions de traitements en cours créant la donnée stockée
        $processingExecutions = $this->processingApiService->getAllExecutions($datastoreId, [
            'output_stored_data' => $storedDataId,
        ])->resolve();
        foreach ($processingExecutions as $procExec) {
            if (in_array($procExec['status'], $blockingProcessingStatuses)) {
                $this->abortExecution($datastoreId, $procExec['_id']);
            }
        }

        // annexe de légende déjà absente : rien à supprimer
        if (isset($storedData['extra']['legend']['annexe_id'])) {
            try {
                $this->annexeApiService->remove($datastoreId, $storedData['extra']['legend']['annexe_id'])->await();
            } catch (ApiException $e) {
                if (Response::HTTP_NOT_FOUND !== $e->getStatusCode()) {
                    throw $e;
                }
            }
        }

        // Suppression de la donnée stockée
        $this->storedDataApiService->remove($datastoreId, $storedDataId)->await();
    }

    // 409 : l’annulation n’a pas de sens (exécution terminée entre la liste et l’annulation)
    private function abortExecution(string $datastoreId, string $executionId): void
    {
        try {
            $this->processingApiService->abortExecution($datastoreId, $executionId)->await();
        } catch (ApiException $e) {
            if (Response::HTTP_CONFLICT !== $e->getStatusCode()) {
                throw $e;
            }
        }
    }
}
