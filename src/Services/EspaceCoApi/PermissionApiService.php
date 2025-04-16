<?php

namespace App\Services\EspaceCoApi;

class PermissionApiService extends BaseEspaceCoApiService
{
    /**
     * @param array<string> $levels
     * @param array<string> $fields
     */
    public function getAllByCommunity(int $communityId, array $levels = [], $fields = []): array
    {
        $query = ['community' => $communityId];
        if (count($levels)) {
            $query['level'] = implode(',', $levels);
        }
        if (count($fields)) {
            $query['fields'] = $fields;
        }

        return $this->requestAll('permissions', $query);
    }

    /**
     * Ajout d'une permissions.
     *
     * @param array<mixed> $datas
     *
     * @return array<mixed>
     */
    public function add(array $datas): array
    {
        return $this->request('POST', 'permissions', $datas);
    }

    /**
     * Mise a jour d'une permission.
     *
     * @param array<mixed> $datas
     */
    public function update(int $permissionId, array $datas): array
    {
        return $this->request('PATCH', "permissions/$permissionId", $datas);
    }

    /**
     * Suppression d'une permission.
     */
    public function remove(int $permissionId): void
    {
        $this->request('DELETE', "permissions/$permissionId");
    }
}
