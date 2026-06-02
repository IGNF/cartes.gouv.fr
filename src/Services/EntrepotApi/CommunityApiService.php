<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class CommunityApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $api,
    ) {
    }

    public function get(string $communityId): ResponsePromise
    {
        return $this->api->get("communities/$communityId");
    }

    public function getMembers(string $communityId): PaginatedPromise
    {
        return $this->api->requestAll("communities/$communityId/users");
    }

    /**
     * @param array<mixed> $data [name, public, contact]
     */
    public function modifyCommunity(string $communityId, array $data): ResponsePromise
    {
        return $this->api->patch("communities/$communityId", $data);
    }

    /**
     * @param array<mixed> $rights [community_rights, uploads_rights, processings_rights, stored_data_rights, datastore_rights, broadcast_rights]
     */
    public function addOrModifyUserRights(string $communityId, string $userId, array $rights = []): ResponsePromise
    {
        return $this->api->put("communities/$communityId/users/$userId", $rights);
    }

    public function removeUserRights(string $communityId, string $userId): ResponsePromise
    {
        return $this->api->delete("communities/$communityId/users/$userId");
    }

    /**
     * @param array<string,mixed> $query
     */
    public function getPermissions(string $communityId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAll("communities/$communityId/permissions", $query);
    }

    /**
     * @param array<string,mixed> $query
     */
    public function getPermissionStats(string $communityId, string $permissionId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAll("communities/$communityId/permissions/{$permissionId}/stats", $query);
    }

    /**
     * @param array<string,mixed> $query
     */
    public function getStats(string $communityId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAll("communities/$communityId/stats", $query);
    }
}
