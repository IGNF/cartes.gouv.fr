<?php

namespace App\Services;

use App\Security\EntrepotUserCache;
use App\Security\User;
use App\Services\EntrepotApi\DatastoreApiService;
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

    public function getDatastoreTechnicalName(string $datastoreId): string
    {
        $membership = $this->findByDatastore($datastoreId);
        if (null !== $membership) {
            return $membership['community']['technical_name'];
        }

        // non-membre : on laisse l'API Entrepôt répondre elle-même (succès ou erreur)
        $datastore = $this->datastoreApiService->get($datastoreId);

        return $datastore['technical_name'];
    }

    public function getDatastoreCommunityId(string $datastoreId): string
    {
        $membership = $this->findByDatastore($datastoreId);
        if (null !== $membership) {
            return $membership['community']['_id'];
        }

        $datastore = $this->datastoreApiService->get($datastoreId);

        return $datastore['community']['_id'];
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
