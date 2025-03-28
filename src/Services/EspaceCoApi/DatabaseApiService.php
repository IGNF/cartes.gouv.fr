<?php

namespace App\Services\EspaceCoApi;

use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;

class DatabaseApiService extends BaseEspaceCoApiService
{
    /**
     * @param array<mixed> $dbIds
     * @param array<mixed> $fields
     */
    public function getAll(
        #[MapQueryParameter] array $dbIds = [],
        #[MapQueryParameter] ?array $fields = []): array
    {
        if (!count($dbIds)) {
            return $this->requestAll('databases', ['fields' => $fields]);
        }

        $databases = [];
        foreach ($dbIds as $id) {
            $databases[] = $this->getDatabase($id, $fields);
        }

        return $databases;
    }

    /**
     * @param array<mixed> $fields
     */
    public function getDatabase(int $databaseId, #[MapQueryParameter] ?array $fields = []): array
    {
        return $this->request('GET', "databases/$databaseId", [], ['fields' => $fields]);
    }

    /**
     * @param array<string> $fields
     */
    public function getTable(int $databaseId, int $tableId, #[MapQueryParameter] ?array $fields = []): array
    {
        return $this->request('GET', "databases/$databaseId/tables/$tableId", [], ['fields' => $fields]);
    }

    /**
     * @param array<string> $fields
     */
    public function getColumn(int $databaseId, int $tableId, int $columnId, #[MapQueryParameter] ?array $fields = []): array
    {
        return $this->request('GET', "databases/$databaseId/tables/$tableId/columns/$columnId", [], ['fields' => $fields]);
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

    /* public function getColumns(int $databaseId, int $tableId): array
    {
        return $this->request('GET', "databases/$databaseId/tables/$tableId", [], ['fields' => 'columns']);
    } */
}
