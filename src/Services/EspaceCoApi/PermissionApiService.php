<?php

namespace App\Services\EspaceCoApi;

class PermissionApiService extends BaseEspaceCoApiService
{
    /**
     * @param string|null   $levels
     * @param array<string> $fields
     */
    public function getAllByCommunity(int $communityId, $levels = null, $fields = []): array
    {
        $query = ['community' => $communityId];
        if ($levels) {
            $query['level'] = $levels;
        }
        if (count($fields)) {
            $query['fields'] = $fields;
        }

        return $this->requestAll('permissions', $query);
    }

    public function getAllPermissionsForDatabase(int $communityId, int $databaseId): array
    {
        $query = ['group' => $communityId, 'database' => $databaseId];

        return $this->requestAll('permissions', $query);
    }
}
