<?php

namespace App\Services;

use App\Dto\Datastore\DatastoreIdentity;
use App\Security\User;
use App\Services\EntrepotApi\CommunityApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\UserApiService;
use App\Utils;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Seul accès au profil Entrepôt de l'utilisateur courant (corps brut de GET users/me, en cache serveur).
 * Dérive les infos datastore/communauté de l'appartenance au lieu de charger le DTO datastore complet,
 * et porte les mutations d'appartenance pour que l'invalidation du cache ne puisse pas être oubliée.
 */
class MembershipService
{
    public function __construct(
        private readonly Security $security,
        private readonly EntrepotUserCache $entrepotUserCache,
        private readonly DatastoreApiService $datastoreApiService,
        private readonly UserApiService $userApiService,
        private readonly CommunityApiService $communityApiService,
    ) {
    }

    /**
     * @return array<mixed>|null null pour un visiteur anonyme
     */
    public function currentUserProfile(): ?array
    {
        $user = $this->security->getUser();

        return $user instanceof User ? $this->checkedProfile($user, $this->entrepotUserCache->get($user->getId())) : null;
    }

    /**
     * `community.datastore` est un id string dans users/me, absent si la communauté n'a pas de datastore.
     *
     * @return array<mixed>|null
     */
    public function findByDatastore(string $datastoreId): ?array
    {
        return $this->find(fn (array $profile) => $this->findMembership($profile, 'datastore', $datastoreId));
    }

    /**
     * @return array<mixed>|null
     */
    public function findByCommunity(string $communityId): ?array
    {
        return $this->find(fn (array $profile) => $this->findMembership($profile, '_id', $communityId));
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
            $this->entrepotUserCache->invalidate($user->getId());
        }
    }

    /**
     * Recharge users/me à travers le cache serveur, pour que ce pod voie aussi la donnée fraîche.
     *
     * @return array<mixed>|null null pour un visiteur anonyme
     */
    public function refreshCurrentUser(): ?array
    {
        $user = $this->security->getUser();

        return $user instanceof User ? $this->checkedProfile($user, $this->entrepotUserCache->refresh($user->getId())) : null;
    }

    /**
     * Cherche dans le cache, puis une fois avec des données fraîches si absent (l'appartenance a pu changer depuis moins de 60 s).
     *
     * @param callable(array<mixed>): (array<mixed>|null) $lookup
     *
     * @return array<mixed>|null
     */
    private function find(callable $lookup): ?array
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return null;
        }

        $membership = $lookup($this->checkedProfile($user, $this->entrepotUserCache->get($user->getId())));
        if (null !== $membership) {
            return $membership;
        }

        return $lookup($this->checkedProfile($user, $this->entrepotUserCache->refreshThrottled($user->getId())));
    }

    /**
     * Les comparaisons d'appartenance supposent que l'identifiant Entrepôt est le `sub` Keycloak : refus explicite sinon.
     *
     * @param array<mixed> $profile
     *
     * @return array<mixed>
     */
    private function checkedProfile(User $user, array $profile): array
    {
        if (($profile['_id'] ?? null) !== $user->getId()) {
            throw new \UnexpectedValueException(sprintf('Identifiant Entrepôt « %s » différent de l’identifiant Keycloak « %s »', $profile['_id'] ?? '', $user->getId()));
        }

        return $profile;
    }

    /**
     * @param array<mixed> $profile
     *
     * @return array<mixed>|null
     */
    private function findMembership(array $profile, string $communityKey, string $value): ?array
    {
        return Utils::array_find($profile['communities_member'] ?? [], fn (array $member) => ($member['community'][$communityKey] ?? null) === $value);
    }
}
