<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class UserApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $api,
    ) {
    }

    public function getMe(): ResponsePromise
    {
        return $this->api->get('users/me');
    }

    /**
     * @SuppressWarnings(ShortVariable)
     */
    public function getMyCommunityRights(string $communityId): ?array
    {
        $me = $this->getMe()->array();

        foreach ($me['communities_member'] as $communityRights) {
            if ($communityRights['community']['_id'] == $communityId) {
                return $communityRights;
            }
        }

        return null;
    }

    public function getMyKey(string $keyId): ResponsePromise
    {
        return $this->api->get("users/me/keys/$keyId");
    }

    public function getMyKeys(): PaginatedPromise
    {
        return $this->api->requestAll('users/me/keys');
    }

    public function getKeyAccesses(string $keyId): PaginatedPromise
    {
        return $this->api->requestAll("users/me/keys/$keyId/accesses");
    }

    public function getMyPermissions(): PaginatedPromise
    {
        return $this->api->requestAll('users/me/permissions');
    }

    public function getPermission(string $permissionId): ResponsePromise
    {
        return $this->api->get("users/me/permissions/$permissionId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addKey(array $body): ResponsePromise
    {
        return $this->api->post('users/me/keys', $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function updateKey(string $keyId, array $body): array
    {
        $this->api->patch("users/me/keys/$keyId", $body)->await();

        return $this->getMyKey($keyId)->array();
    }

    public function removeKey(string $keyId): ResponsePromise
    {
        return $this->api->delete("users/me/keys/$keyId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addAccess(string $keyId, array $body): ResponsePromise
    {
        return $this->api->post("users/me/keys/$keyId/accesses", $body);
    }

    public function removeAccess(string $keyId, string $accessId): ResponsePromise
    {
        return $this->api->delete("users/me/keys/$keyId/accesses/$accessId");
    }

    public function leaveCommunity(string $communityId): ResponsePromise
    {
        return $this->api->delete("users/me/communities/$communityId");
    }
}
