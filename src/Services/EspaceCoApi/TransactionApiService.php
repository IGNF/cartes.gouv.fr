<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedResponse;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class TransactionApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $query
     */
    public function getList(string $databaseId, array $query = []): PaginatedResponse
    {
        return $this->api->get("databases/{$databaseId}/transactions", $query)->arrayWithHeaders();
    }

    /**
     * @param array<mixed> $body
     */
    public function add(string $databaseId, array $body): ResponsePromise
    {
        return $this->api->post("databases/{$databaseId}/transactions", $body);
    }

    /**
     * @param array<mixed> $query
     */
    public function get(string $databaseId, string $transactionId, array $query = []): ResponsePromise
    {
        return $this->api->get("databases/{$databaseId}/transactions/{$transactionId}", $query);
    }
}
