<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class DatabaseApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $fields
     */
    public function getAll(?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->requestAll('databases', $query);
    }

    /**
     * @param array<string> $fields
     */
    public function searchBy(string $field, string $value, string $sort, ?array $fields = []): array
    {
        $query = [$field => $value, 'sort' => $sort];
        if (!empty($fields)) {
            $query['fields'] = $fields;
        }

        return $this->api->requestAll('databases', $query);
    }

    /**
     * @param array<mixed> $fields
     */
    public function getDatabase(int $databaseId, ?array $fields = []): PendingResponse
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->get("databases/$databaseId", $query);
    }

    /**
     * @param array<string> $fields
     */
    public function getTable(int $databaseId, int $tableId, ?array $fields = []): PendingResponse
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->get("databases/$databaseId/tables/$tableId", $query);
    }

    /**
     * @param array<string> $fields
     */
    public function getColumn(int $databaseId, int $tableId, int $columnId, ?array $fields = []): PendingResponse
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->get("databases/$databaseId/tables/$tableId/columns/$columnId", $query);
    }

    /**
     * @param array<string> $fields
     */
    public function getColumnByName(int $databaseId, int $tableId, string $column, ?array $fields = []): PendingResponse
    {
        $query = ['name' => $column];
        if (!empty($fields)) {
            $query['fields'] = $fields;
        }

        return $this->api->get("databases/$databaseId/tables/$tableId/columns", $query);
    }

    /**
     * @param array<string> $fields
     */
    public function getAllTables(int $databaseId, ?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->requestAll("databases/$databaseId/tables", $query);
    }
}
