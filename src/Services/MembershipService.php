<?php

namespace App\Services;

use App\Dto\Datastore\DatastoreIdentity;
use App\Security\EntrepotUserCache;
use App\Security\User;
use App\Services\EntrepotApi\DatastoreApiService;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Dérive les infos datastore/communauté de l'appartenance de l'utilisateur courant, au lieu de charger le DTO datastore complet.
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

    /**
     * À appeler après une mutation d'appartenance faite par l'utilisateur lui-même.
     */
    public function invalidateCurrentUser(): void
    {
        $user = $this->security->getUser();
        if ($user instanceof User) {
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

        $user->updateFromApiInfo($this->entrepotUserCache->refresh($user->getKeycloakId()));
    }

    /**
     * Cherche dans le token, puis une fois avec des données fraîches si absent (l'appartenance a pu changer depuis moins de 60 s).
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

        $user->updateFromApiInfo($this->entrepotUserCache->refreshThrottled($user->getKeycloakId()));

        return $lookup($user);
    }
}
