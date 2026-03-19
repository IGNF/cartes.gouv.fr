<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class UserApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $api,
    ) {
    }

    public function getMe(): PendingResponse
    {
        return $this->api->get('users/me');
    }

    /**
     * @SuppressWarnings(ShortVariable)
     */
    public function getMyCommunityRights(string $communityId): ?array
    {
        $me = $this->getMe()->json();

        foreach ($me['communities_member'] as $communityRights) {
            if ($communityRights['community']['_id'] == $communityId) {
                return $communityRights;
            }
        }

        return null;
    }

    public function getMyKey(string $keyId): PendingResponse
    {
        return $this->api->get("users/me/keys/$keyId");
    }

    public function getMyKeys(): array
    {
        return $this->api->requestAll('users/me/keys');
    }

    public function getKeyAccesses(string $keyId): array
    {
        return $this->api->requestAll("users/me/keys/$keyId/accesses");
    }

    public function getMyPermissions(): array
    {
        return $this->api->requestAll('users/me/permissions');
    }

    public function getPermission(string $permissionId): PendingResponse
    {
        return $this->api->get("users/me/permissions/$permissionId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addKey(array $body): PendingResponse
    {
        return $this->api->post('users/me/keys', $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function updateKey(string $keyId, array $body): array
    {
        $this->api->patch("users/me/keys/$keyId", $body)->wait();

        return $this->getMyKey($keyId)->json();
    }

    public function removeKey(string $keyId): PendingResponse
    {
        return $this->api->delete("users/me/keys/$keyId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addAccess(string $keyId, array $body): PendingResponse
    {
        return $this->api->post("users/me/keys/$keyId/accesses", $body);
    }

    public function removeAccess(string $keyId, string $accessId): PendingResponse
    {
        return $this->api->delete("users/me/keys/$keyId/accesses/$accessId");
    }

    public function leaveCommunity(string $communityId): PendingResponse
    {
        return $this->api->delete("users/me/communities/$communityId");
    }
}
