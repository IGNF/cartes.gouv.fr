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
 * Dérive les infos datastore/communauté de l'appartenance de l'utilisateur courant, au lieu de charger le DTO datastore complet.
 * Porte aussi les mutations d'appartenance, pour que l'invalidation du snapshot utilisateur ne puisse pas être oubliée.
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
     * @return array<mixed>|null
     */
    public function findByDatastore(string $datastoreId): ?array
    {
        // `community.datastore` est un id string dans users/me, absent si la communauté n'a pas de datastore
        return $this->find('datastore', $datastoreId);
    }

    /**
     * @return array<mixed>|null
     */
    public function findByCommunity(string $communityId): ?array
    {
        return $this->find('_id', $communityId);
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
     * Profil Entrepôt (users/me) de l'utilisateur courant, en cache 60 s ; $fresh force la relecture.
     *
     * @return array<mixed>
     */
    public function currentProfile(bool $fresh = false): array
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new \LogicException('Aucun utilisateur connecté');
        }

        return $fresh ? $this->entrepotUserCache->refresh($user->getId()) : $this->entrepotUserCache->get($user->getId());
    }

    /**
     * Cherche dans le profil en cache, puis une fois avec des données fraîches si absent (l'appartenance a pu changer depuis moins de 60 s).
     *
     * @return array<mixed>|null
     */
    private function find(string $communityKey, string $value): ?array
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return null;
        }

        $lookup = fn (array $profile) => Utils::array_find($profile['communities_member'] ?? [], fn (array $member) => ($member['community'][$communityKey] ?? null) === $value);

        return $lookup($this->entrepotUserCache->get($user->getId())) ?? $lookup($this->entrepotUserCache->refreshThrottled($user->getId()));
    }
}
