<?php

namespace App\Services\EspaceCoApi;

class PermissionApiService extends BaseEspaceCoApiService
{
    /**
     * @param string|null $level
     */
    public function getAllByCommunity(int $communityId, $level = null): array
    {
        $query = ['group' => $communityId];
        if (!is_null($level)) {
            $query['level'] = $level;
        }

        return $this->requestAll('permissions', $query);
    }

    public function getAllPermissionsForDatabase(int $communityId, int $databaseId): array
    {
        $query = ['group' => $communityId, 'database' => $databaseId];

        return $this->requestAll('permissions', $query);
    }
}
