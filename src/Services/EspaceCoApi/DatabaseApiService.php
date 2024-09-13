<?php

namespace App\Services\EspaceCoApi;

class DatabaseApiService extends BaseEspaceCoApiService
{
    public function getTable(int $databaseId, int $tableId): array
    {
        return $this->request('GET', "databases/$databaseId/tables/$tableId");
    }

    public function getTableFullName(int $databaseId, int $tableId): string
    {
        return $this->request('GET', "databases/$databaseId/tables/$tableId", [], ['fields' => 'full_name']);
    }

    /**
     * @param array<string> $fields
     */
    public function getAllTables(int $databaseId, array $fields = []): array
    {
        return $this->requestAll("databases/$databaseId/tables", ['fields' => $fields]);
    }

    public function getColumns(int $databaseId, int $tableId): array
    {
        return $this->request('GET', "databases/$databaseId/tables/$tableId", [], ['fields' => 'columns']);
    }
}
