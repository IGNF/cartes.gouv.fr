<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class PermissionApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<string> $levels
     * @param array<string> $fields
     */
    public function getAllByCommunity(int $communityId, array $levels = [], $fields = []): PaginatedPromise
    {
        $query = ['community' => $communityId];
        if (count($levels)) {
            $query['level'] = implode(',', $levels);
        }
        if (count($fields)) {
            $query['fields'] = $fields;
        }

        return $this->api->requestAll('permissions', $query);
    }

    /**
     * Ajout d'une permissions.
     *
     * @param array<mixed> $datas
     */
    public function add(array $datas): ResponsePromise
    {
        return $this->api->post('permissions', $datas);
    }

    /**
     * Mise a jour d'une permission.
     *
     * @param array<mixed> $datas
     */
    public function update(int $permissionId, array $datas): ResponsePromise
    {
        return $this->api->patch("permissions/$permissionId", $datas);
    }

    /**
     * Suppression d'une permission.
     */
    public function remove(int $permissionId): ResponsePromise
    {
        return $this->api->delete("permissions/$permissionId");
    }
}
