<?php

namespace App\Security;

use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Principal Keycloak, construit depuis la réponse userinfo (en cache 60 s par jeton, voir `KeycloakUserProvider`).
 * Le profil Entrepôt est servi à part par `App\Services\MembershipService`.
 */
class User implements UserInterface
{
    private readonly string $id;
    private readonly string $email;
    private readonly string $userName;
    private readonly ?string $firstName;
    private readonly ?string $lastName;

    /**
     * @param array<string, mixed> $userInfo
     * @param int                  $sessionExpiresAt expiration du jeton d’accès, en secondes Unix
     */
    public function __construct(array $userInfo, private readonly int $sessionExpiresAt)
    {
        $sub = $userInfo['sub'] ?? null;
        $email = $userInfo['email'] ?? null;
        if (!\is_string($sub) || '' === $sub || !\is_string($email) || '' === $email) {
            throw new \UnexpectedValueException('userinfo sans identifiant (sub) ou sans adresse e-mail');
        }

        $this->id = $sub;
        $this->email = $email;
        $this->userName = \is_string($userInfo['preferred_username'] ?? null) ? $userInfo['preferred_username'] : $email;
        $this->firstName = \is_string($userInfo['given_name'] ?? null) ? $userInfo['given_name'] : null;
        $this->lastName = \is_string($userInfo['family_name'] ?? null) ? $userInfo['family_name'] : null;
    }

    /**
     * Identifiant Keycloak (claim `sub`), identique à l’identifiant utilisateur de l’Entrepôt.
     */
    public function getId(): string
    {
        return $this->id;
    }

    /**
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return $this->id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getUserName(): string
    {
        return $this->userName;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function getSessionExpiresAt(): int
    {
        return $this->sessionExpiresAt;
    }

    /**
     * Keycloak ne porte aucun rôle applicatif : les droits sont ceux de l’Entrepôt et de l’espace collaboratif.
     *
     * @see UserInterface
     */
    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    /**
     * @see UserInterface
     */
    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // Encore exigée par UserInterface en 7.4, Symfony ne l’appelle plus si elle porte #[\Deprecated]
    }
}
