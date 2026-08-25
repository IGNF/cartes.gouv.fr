<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\Security\User;
use App\Services\MembershipService;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Actions faites au nom du compte de service du bac à sable (et non de l'utilisateur connecté).
 */
class ServiceAccount
{
    private ?string $sandboxCommunityId;

    public function __construct(
        ParameterBagInterface $parameters,
        private Security $security,
        private MembershipService $membershipService,
        #[Autowire(service: 'app.api_client.entrepot_sandbox_service_account')]
        private ApiClient $api,
    ) {
        // id vide dans la config par défaut : bac à sable non configuré
        $this->sandboxCommunityId = ($parameters->get('sandbox')['community_id'] ?? null) ?: null;
    }

    /**
     * Ajoute l'utilisateur connecté à la communauté du bac à sable (no-op s'il en est déjà membre).
     *
     * @throws AccessDeniedException bac à sable non configuré, utilisateur absent ou compte de service non authentifié
     */
    public function addCurrentUserToSandbox(): void
    {
        if (null === $this->sandboxCommunityId) {
            throw new AccessDeniedException('Bac à sable non configuré');
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException();
        }

        // lecture fraîche : le token peut encore lister une appartenance quittée il y a moins de 60 s sur un autre pod
        $this->membershipService->refreshCurrentUser();
        if (null !== $user->findMembershipByCommunity($this->sandboxCommunityId)) {
            return;
        }

        $this->api->put("communities/{$this->sandboxCommunityId}/users/{$user->getId()}", [
            'rights' => ['ANNEX', 'BROADCAST', 'PROCESSING', 'UPLOAD'],
        ])->await();
    }
}
