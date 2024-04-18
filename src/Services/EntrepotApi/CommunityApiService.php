<?php

namespace App\Services\EntrepotApi;

class CommunityApiService extends BaseEntrepotApiService
{
    public function get(string $communityId): array
    {
        return $this->request('GET', "communities/$communityId");
    }

    public function getMembers(string $communityId): array
    {
        return $this->requestAll("communities/$communityId/users");
    }

    /**
     * @param array<mixed> $data [name, public, contact]
     */
    public function modifyCommunity(string $communityId, array $data): array
    {
        return $this->request('PATCH', "communities/$communityId", $data);
    }

    /**
     * @param array<mixed> $rights [community_rights, uploads_rights, processings_rights, stored_data_rights, datastore_rights, broadcast_rights]
     */
    public function addOrModifyUserRights(string $communityId, string $userId, array $rights = []): array
    {
        return $this->request('PUT', "communities/$communityId/users/$userId", $rights);
    }

    public function removeUserRights(string $communityId, string $userId): array
    {
        return $this->request('DELETE', "communities/$communityId/users/$userId");
    }
}
