<?php

namespace App\Services\EspaceCoApi;

class TransactionApiService extends BaseEspaceCoApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getList(string $databaseId, array $query = []): array
    {
        return $this->request('GET', "databases/{$databaseId}/transactions", [], $query, [], false, true, true);
    }

    /**
     * @param array<mixed> $body
     */
    public function add(string $databaseId, array $body): array
    {
        return $this->request('POST', "databases/{$databaseId}/transactions", $body);
    }

    /**
     * @param array<mixed> $query
     */
    public function get(string $databaseId, string $transactionId, array $query = []): array
    {
        return $this->request('GET', "databases/{$databaseId}/transactions/{$transactionId}", [], $query);
    }
}
