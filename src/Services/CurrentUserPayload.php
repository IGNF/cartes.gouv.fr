<?php

namespace App\Services;

use App\Security\User;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Charge utilisateur envoyée au front, identique dans la page (`#user`) et dans `GET /api/users/me` :
 * identité Keycloak, profil Entrepôt dans la structure de l’API Entrepôt, expiration de session.
 */
final readonly class CurrentUserPayload
{
    public function __construct(
        private Security $security,
        private MembershipService $membershipService,
    ) {
    }

    /**
     * @return array<string, mixed>|null null pour un visiteur anonyme
     */
    public function build(bool $refresh = false): ?array
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return null;
        }

        $profile = $refresh ? $this->membershipService->refreshCurrentUser() : $this->membershipService->currentUserProfile();

        // l’identité de connexion prime sur la copie qu’en garde l’Entrepôt
        return [
            'email' => $user->getEmail(),
            'user_name' => $user->getUserName(),
            'first_name' => $user->getFirstName(),
            'last_name' => $user->getLastName(),
            'roles' => $user->getRoles(),
        ] + ($profile ?? []) + [
            'session_expires_at' => $user->getSessionExpiresAt(),
        ];
    }
}
