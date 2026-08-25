<?php

namespace App\Services;

use App\Dto\Datastore\DatastoreIdentity;
use App\Security\EntrepotUserCache;
use App\Security\User;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\UserApiService;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Dérive les infos datastore/communauté de l'appartenance de l'utilisateur courant,
 * au lieu de charger le DTO datastore complet depuis l'API Entrepôt.
 */
class MembershipService
{
    public function __construct(
        private Security $security,
        private EntrepotUserCache $entrepotUserCache,
        private DatastoreApiService $datastoreApiService,
        private UserApiService $userApiService,
    ) {
    }

    /**
     * @return array<mixed>|null
     */
    public function findByDatastore(string $datastoreId): ?array
    {
        return $this->find(fn (User $user) => $user->findMembershipByDatastore($datastoreId));
    }

    /**
     * @return array<mixed>|null
     */
    public function findByCommunity(string $communityId): ?array
    {
        return $this->find(fn (User $user) => $user->findMembershipByCommunity($communityId));
    }

    /**
     * Nom, nom technique et communauté du datastore, depuis l'appartenance ; sinon un seul chargement du DTO Entrepôt.
     */
    public function getDatastoreIdentity(string $datastoreId): DatastoreIdentity
    {
        $membership = $this->findByDatastore($datastoreId);
        if (null !== $membership) {
            return new DatastoreIdentity(
                $membership['community']['name'],
                $membership['community']['technical_name'],
                $membership['community']['_id'],
            );
        }

        // non-membre : on laisse l'API Entrepôt répondre elle-même (succès ou erreur)
        $datastore = $this->datastoreApiService->get($datastoreId);

        return new DatastoreIdentity($datastore['name'], $datastore['technical_name'], $datastore['community']['_id']);
    }

    public function getDatastoreTechnicalName(string $datastoreId): string
    {
        return $this->getDatastoreIdentity($datastoreId)->technicalName;
    }

    public function getDatastoreCommunityId(string $datastoreId): string
    {
        return $this->getDatastoreIdentity($datastoreId)->communityId;
    }

    /**
     * À appeler après une mutation d'appartenance faite par l'utilisateur lui-même.
     */
    public function invalidateCurrentUser(): void
    {
        $user = $this->security->getUser();
        if ($user instanceof User && null !== $user->getKeycloakId()) {
            $this->entrepotUserCache->invalidate($user->getKeycloakId());
        }
    }

    /**
     * Recharge users/me à travers le cache serveur et met à jour l'utilisateur du token.
     */
    public function refreshCurrentUser(): void
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return;
        }

        $keycloakId = $user->getKeycloakId();
        $apiUserInfo = null !== $keycloakId
            ? $this->entrepotUserCache->refresh($keycloakId)
            : $this->userApiService->getMe()->array();
        $user->updateFromApiInfo($apiUserInfo);
    }

    /**
     * Cherche dans le token, puis re-vérifie une fois avec des données fraîches si absent
     * (l'appartenance a pu changer il y a moins de 60 s, le TTL du cache).
     *
     * @param callable(User): (array<mixed>|null) $lookup
     *
     * @return array<mixed>|null
     */
    private function find(callable $lookup): ?array
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return null;
        }

        $membership = $lookup($user);
        if (null !== $membership) {
            return $membership;
        }

        $keycloakId = $user->getKeycloakId();
        if (null === $keycloakId) {
            return null;
        }

        $user->updateFromApiInfo($this->entrepotUserCache->refreshThrottled($keycloakId));

        return $lookup($user);
    }
}
