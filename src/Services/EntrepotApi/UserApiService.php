<?php

namespace App\Services\EntrepotApi;

use App\Exception\EntrepotApiException;

class UserApiService extends AbstractEntrepotApiService
{
    public function getMe(): array
    {
        return $this->request('GET', 'users/me');
    }

    /**
     * @SuppressWarnings(ShortVariable)
     */
    public function getMyDatastores(): array
    {
        $me = $this->getMe();

        $datastoresList = [];
        $communitiesMember = $me['communities_member'];
        foreach ($communitiesMember as $communityMember) {
            $community = $communityMember['community'];
            if (isset($community['datastore'])) {
                $datastoresList[] = $community['datastore'];
            }
        }

        $datastores = [];
        foreach ($datastoresList as $datastoreId) {
            try {
                $datastores[] = $this->entrepotApiService->datastore->get($datastoreId);
            } catch (EntrepotApiException $ex) {
                // Rien à faire de particulier. On ignore silencieusement l'erreur et pour l'utilisateur c'est comme si ce datastore n'existait pas.
            }
        }

        return $datastores;
    }

    /**
     * @SuppressWarnings(ShortVariable)
     */
    public function getMyCommunityRights(string $communityId): ?array
    {
        $me = $this->getMe();

        foreach ($me['communities_member'] as $communityRights) {
            if ($communityRights['community']['_id'] == $communityId) {
                return $communityRights;
            }
        }

        return null;
    }

    public function getMyKeys(): array
    {
        return $this->requestAll("users/me/keys");
    }

    public function getKeyAccesses(string $keyId) : array
    {
        return $this->requestAll("users/me/keys/$keyId/accesses");
    }

    public function getMyPermissions(): array
    {
        return $this->requestAll("users/me/permissions");
    }

    public function getPermission(string $permissionId): array
    {
        return $this->request('GET', "users/me/permissions/$permissionId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addKey(array $body): array
    {
        return $this->request('POST', "users/me/keys", $body);
    }
    
    public function removeKey(string $keyId): array
    {
        return $this->request('DELETE', "users/me/keys/$keyId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addAccess(string $keyId, array $body): array
    {
        return $this->request('POST', "users/me/keys/$keyId/accesses", $body); 
    }
}
