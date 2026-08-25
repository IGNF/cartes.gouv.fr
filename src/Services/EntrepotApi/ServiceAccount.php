<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\ServiceAccountAuthenticationException;
use App\Security\User;
use App\Services\MembershipService;
use App\Services\SandboxService;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Actions faites au nom du compte de service du bac à sable (et non de l'utilisateur connecté).
 */
class ServiceAccount
{
    public function __construct(
        private Security $security,
        private MembershipService $membershipService,
        private SandboxService $sandboxService,
        #[Autowire(service: 'app.api_client.entrepot_sandbox_service_account')]
        private ApiClient $api,
    ) {
    }

    /**
     * Ajoute l'utilisateur connecté à la communauté du bac à sable (no-op s'il en est déjà membre).
     *
     * @throws AccessDeniedException bac à sable non configuré, utilisateur absent ou compte de service non authentifié
     */
    public function addCurrentUserToSandbox(): void
    {
        $sandboxCommunityId = $this->sandboxService->getSandboxCommunityId();
        if (null === $sandboxCommunityId) {
            throw new AccessDeniedException('Bac à sable non configuré');
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException();
        }

        // lecture fraîche : le token peut encore lister une appartenance quittée il y a moins de 60 s sur un autre pod
        $this->membershipService->refreshCurrentUser();
        if (null !== $user->findMembershipByCommunity($sandboxCommunityId)) {
            return;
        }

        try {
            $this->api->put("communities/$sandboxCommunityId/users/{$user->getId()}", [
                'rights' => ['ANNEX', 'BROADCAST', 'PROCESSING', 'UPLOAD'],
            ])->await();
        } catch (ServiceAccountAuthenticationException $e) {
            throw new AccessDeniedException('Compte de service non authentifié', $e);
        }
    }
}
