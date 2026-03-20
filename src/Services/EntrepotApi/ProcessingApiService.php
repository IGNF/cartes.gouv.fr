<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\ResponsePromise;
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
    public function getAll(string $datastoreId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAll("datastores/$datastoreId/processings", $query);
    }

    public function get(string $datastoreId, string $processingId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/processings/$processingId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addExecution(string $datastoreId, array $body = []): ResponsePromise
    {
        return $this->api->post("datastores/$datastoreId/processings/executions", $body);
    }

    public function launchExecution(string $datastoreId, string $executionId): ResponsePromise
    {
        return $this->api->post("datastores/$datastoreId/processings/executions/$executionId/launch");
    }

    public function abortExecution(string $datastoreId, string $executionId): ResponsePromise
    {
        return $this->api->post("datastores/$datastoreId/processings/executions/$executionId/abort");
    }

    /**
     * @param array<mixed> $query
     */
    public function getAllExecutions(string $datastoreId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAll("datastores/$datastoreId/processings/executions", $query);
    }

    /**
     * @param array<mixed> $query
     */
    public function getAllExecutionsDetailed(string $datastoreId, array $query = []): array
    {
        $processingExecutions = $this->getAllExecutions($datastoreId, $query)->resolve();

        return $this->api->fetchAllDetailsAsync(
            $processingExecutions,
            fn (array $procExec): ResponsePromise => $this->getExecution($datastoreId, $procExec['_id'])
        );
    }

    public function getExecution(string $datastoreId, string $processingExecutionId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/processings/executions/$processingExecutionId");
    }

    public function getExecutionLogs(string $datastoreId, string $processingExecutionId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/processings/executions/$processingExecutionId/logs");
    }

    public function removeExecution(string $datastoreId, string $processingExecutionId): ResponsePromise
    {
        return $this->api->delete("datastores/$datastoreId/processings/executions/$processingExecutionId");
    }
}
