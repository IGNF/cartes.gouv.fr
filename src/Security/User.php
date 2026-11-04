<?php

namespace App\Security;

use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Identité Keycloak de l'utilisateur connecté ; le profil Entrepôt se lit par MembershipService.
 */
class User implements UserInterface
{
    /**
     * @param non-empty-string $email
     */
    public function __construct(
        private readonly string $id,
        private readonly string $email,
        private readonly string $userName,
        private readonly ?string $firstName = null,
        private readonly ?string $lastName = null,
    ) {
    }

    // claim sub, égal à l'identifiant utilisateur Entrepôt
    public function getId(): string
    {
        return $this->id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getUserIdentifier(): string
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

    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // Encore exigée par UserInterface en 7.4, Symfony ne l’appelle plus si elle porte #[\Deprecated]
    }
}
