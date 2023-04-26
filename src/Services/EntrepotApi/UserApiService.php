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
                $datastores[$datastoreId] = $this->entrepotApiService->datastore->get($datastoreId);
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
}
