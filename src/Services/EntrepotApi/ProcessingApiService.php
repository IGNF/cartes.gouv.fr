<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class ProcessingApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): array
    {
        return $this->api->requestAll("datastores/$datastoreId/processings", $query);
    }

    public function get(string $datastoreId, string $processingId): PendingResponse
    {
        return $this->api->get("datastores/$datastoreId/processings/$processingId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addExecution(string $datastoreId, array $body = []): PendingResponse
    {
        return $this->api->post("datastores/$datastoreId/processings/executions", $body);
    }

    public function launchExecution(string $datastoreId, string $executionId): PendingResponse
    {
        return $this->api->post("datastores/$datastoreId/processings/executions/$executionId/launch");
    }

    public function abortExecution(string $datastoreId, string $executionId): PendingResponse
    {
        return $this->api->post("datastores/$datastoreId/processings/executions/$executionId/abort");
    }

    /**
     * @param array<mixed> $query
     */
    public function getAllExecutions(string $datastoreId, array $query = []): array
    {
        return $this->api->requestAll("datastores/$datastoreId/processings/executions", $query);
    }

    /**
     * @param array<mixed> $query
     */
    public function getAllExecutionsDetailed(string $datastoreId, array $query = []): array
    {
        $processingExecutions = $this->getAllExecutions($datastoreId, $query);

        return $this->api->fetchAllDetailsAsync(
            $processingExecutions,
            fn (array $procExec): PendingResponse => $this->getExecution($datastoreId, $procExec['_id'])
        );
    }

    public function getExecution(string $datastoreId, string $processingExecutionId): PendingResponse
    {
        return $this->api->get("datastores/$datastoreId/processings/executions/$processingExecutionId");
    }

    public function getExecutionLogs(string $datastoreId, string $processingExecutionId): PendingResponse
    {
        return $this->api->get("datastores/$datastoreId/processings/executions/$processingExecutionId/logs");
    }

    public function removeExecution(string $datastoreId, string $processingExecutionId): PendingResponse
    {
        return $this->api->delete("datastores/$datastoreId/processings/executions/$processingExecutionId");
    }
}
