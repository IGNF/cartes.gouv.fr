<?php

namespace App\Services;

use App\Dto\Datastore\DatastoreIdentity;
use App\Security\EntrepotUserCache;
use App\Security\User;
use App\Services\EntrepotApi\CommunityApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\UserApiService;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Dérive les infos datastore/communauté de l'appartenance de l'utilisateur courant, au lieu de charger le DTO datastore complet.
 * Porte aussi les mutations d'appartenance, pour que l'invalidation du snapshot utilisateur ne puisse pas être oubliée.
 */
class MembershipService
{
    public function __construct(
        private Security $security,
        private EntrepotUserCache $entrepotUserCache,
        private DatastoreApiService $datastoreApiService,
        private UserApiService $userApiService,
        private CommunityApiService $communityApiService,
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

    public function leaveCommunity(string $communityId): void
    {
        $this->userApiService->leaveCommunity($communityId)->await();
        $this->invalidateCurrentUser();
    }

    /**
     * @param array<string> $rights
     */
    public function setMemberRights(string $communityId, string $userId, array $rights): void
    {
        $this->communityApiService->addOrModifyUserRights($communityId, $userId, ['rights' => $rights])->await();
        $this->invalidateCurrentUser($userId);
    }

    public function removeMember(string $communityId, string $userId): void
    {
        $this->communityApiService->removeUserRights($communityId, $userId)->await();
        $this->invalidateCurrentUser($userId);
    }

    /**
     * @param array<mixed> $data
     *
     * @return array<mixed> la communauté modifiée
     */
    public function modifyCommunity(string $communityId, array $data): array
    {
        $community = $this->communityApiService->modifyCommunity($communityId, $data)->array();
        // le nom de la communauté fait partie des infos dérivées de l'appartenance
        $this->invalidateCurrentUser();

        return $community;
    }

    /**
     * Invalide le snapshot de l'utilisateur courant ; avec $userId, seulement si la mutation le concerne.
     * Public pour les mutations faites hors de ce service (compte de service).
     */
    public function invalidateCurrentUser(?string $userId = null): void
    {
        $user = $this->security->getUser();
        if ($user instanceof User && (null === $userId || $user->getId() === $userId)) {
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
