<?php

namespace App\Services\EntrepotApi;

class ProcessingApiService extends BaseEntrepotApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): array
    {
        return $this->request('GET', "datastores/$datastoreId/processings", [], $query);
    }

    public function get(string $datastoreId, string $processingId): array
    {
        return $this->request('GET', "datastores/$datastoreId/processings/$processingId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addExecution(string $datastoreId, array $body = []): array
    {
        return $this->request('POST', "datastores/$datastoreId/processings/executions", $body);
    }

    public function launchExecution(string $datastoreId, string $executionId): void
    {
        $this->request('POST', "datastores/$datastoreId/processings/executions/$executionId/launch");
    }

    /**
     * @param array<mixed> $query
     */
    public function getAllExecutions(string $datastoreId, array $query = []): array
    {
        return $this->request('GET', "datastores/$datastoreId/processings/executions", [], $query);
    }

    public function getExecution(string $datastoreId, string $processingExecutionId): array
    {
        return $this->request('GET', "datastores/$datastoreId/processings/executions/$processingExecutionId");
    }

    public function getExecutionLogs(string $datastoreId, string $processingExecutionId): array
    {
        return $this->request('GET', "datastores/$datastoreId/processings/executions/$processingExecutionId/logs", [], [], [], false, true);
    }

    public function removeExecution(string $datastoreId, string $processingExecutionId): void
    {
        $this->request('DELETE', "datastores/$datastoreId/processings/executions/$processingExecutionId");
    }
}
