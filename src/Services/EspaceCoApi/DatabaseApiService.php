<?php

namespace App\Services\EspaceCoApi;

class DatabaseApiService extends BaseEspaceCoApiService
{
    /**
     * @param array<mixed> $fields
     */
    public function getAll(?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->requestAll('databases', $query);
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

        return $this->requestAll('databases', $query);
    }

    /**
     * @param array<mixed> $fields
     */
    public function getDatabase(int $databaseId, ?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->request('GET', "databases/$databaseId", [], $query);
    }

    /**
     * @param array<string> $fields
     */
    public function getTable(int $databaseId, int $tableId, ?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->request('GET', "databases/$databaseId/tables/$tableId", [], $query);
    }

    /**
     * @param array<string> $fields
     */
    public function getColumn(int $databaseId, int $tableId, int $columnId, ?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->request('GET', "databases/$databaseId/tables/$tableId/columns/$columnId", [], $query);
    }

    public function getTableFullName(int $databaseId, int $tableId): string
    {
        return $this->request('GET', "databases/$databaseId/tables/$tableId", [], ['fields' => 'full_name']);
    }

    /**
     * @param array<string> $fields
     */
    public function getAllTables(int $databaseId, ?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->requestAll("databases/$databaseId/tables", $query);
    }
}
