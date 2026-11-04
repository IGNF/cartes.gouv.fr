<?php

namespace App\Services;

use App\Security\User;

/**
 * Utilisateur tel que le front le lit (type `CartesUser`) : identité du cookie et profil Entrepôt.
 */
class CartesUserPayload
{
    public function __construct(
        private readonly MembershipService $membershipService,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function build(User $user, bool $fresh): array
    {
        $profile = $this->membershipService->currentProfile($fresh);

        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'user_name' => $user->getUserName(),
            'first_name' => $user->getFirstName(),
            'last_name' => $user->getLastName(),
            'roles' => $user->getRoles(),
            'communities_member' => $profile['communities_member'] ?? [],
            'account_creation_date' => $profile['creation'] ?? null,
            'last_login_date' => $profile['last_login'] ?? null,
            'documents_quota' => $profile['documents_quota'] ?? null,
            'documents_use' => $profile['documents_use'] ?? null,
            'keys_quota' => $profile['keys_quota'] ?? null,
            'keys_use' => $profile['keys_use'] ?? null,
        ];
    }
}
