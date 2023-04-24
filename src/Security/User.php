<?php

namespace App\Security;

use Symfony\Component\Security\Core\User\UserInterface;

class User implements UserInterface
{
    private string $email;
    private string $id;

    /** @var array<string> */
    private array $roles = [];

    private string $firstName;
    private string $lastName;

    /** @var array<string> */
    private array $communitiesMember = [];

    private \DateTimeInterface $accountCreationDate;
    private \DateTimeInterface $lastApiCallDate;

    public function __construct(array $keycloakUserInfo = [], array $apiUserInfo = [])
    {
        $this->email = $keycloakUserInfo['email'];
        $this->id = $apiUserInfo['_id'];
        $this->firstName = $keycloakUserInfo['given_name'];
        $this->lastName = $keycloakUserInfo['family_name'];

        $this->accountCreationDate = new \DateTime($apiUserInfo['creation']);
        $this->lastApiCallDate = new \DateTime($apiUserInfo['last_call']);

        if (array_key_exists('communities_member', $apiUserInfo)) {
            foreach ($apiUserInfo['communities_member'] as $community) {
                $this->communitiesMember[$community['community']['_id']] = $community;
            }
        }
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function getCommunitiesMember(): array
    {
        return $this->communitiesMember;
    }

    public function getAccountCreationDate(): ?\DateTimeInterface
    {
        return $this->accountCreationDate;
    }

    public function getLastApiCallDate(): ?\DateTimeInterface
    {
        return $this->lastApiCallDate;
    }
}
