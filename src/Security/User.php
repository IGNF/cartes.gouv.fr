<?php

namespace App\Security;

use Symfony\Component\Security\Core\User\UserInterface;

class User implements UserInterface
{
    private string $email;
    private string $userName;
    private string $id;

    /** @var array<string> */
    private array $roles = [];

    private ?string $firstName;
    private ?string $lastName;

    /** @var array<mixed> */
    private array $communitiesMember = [];

    private ?\DateTimeInterface $accountCreationDate;
    private ?\DateTimeInterface $lastLoginDate;

    private ?int $documentsQuota;
    private ?int $documentsUse;
    private ?int $keysQuota;
    private ?int $keysUse;

    /**
     * @param array<mixed> $keycloakUserInfo
     * @param array<mixed> $apiUserInfo
     */
    public function __construct(array $keycloakUserInfo = [], array $apiUserInfo = [])
    {
        $this->email = $keycloakUserInfo['email'];
        $this->id = $apiUserInfo['_id'];
        $this->firstName = $keycloakUserInfo['given_name'] ?? null;
        $this->lastName = $keycloakUserInfo['family_name'] ?? null;
        $this->userName = $keycloakUserInfo['preferred_username'];
        $this->accountCreationDate = null;
        $this->lastLoginDate = null;

        if (array_key_exists('creation', $apiUserInfo)) {
            $this->accountCreationDate = new \DateTime($apiUserInfo['creation']);
        }

        if (array_key_exists('last_login', $apiUserInfo)) {
            $this->lastLoginDate = new \DateTime($apiUserInfo['last_login']);
        }

        if (array_key_exists('documents_quota', $apiUserInfo)) {
            $this->documentsQuota = $apiUserInfo['documents_quota'];
        }

        if (array_key_exists('documents_use', $apiUserInfo)) {
            $this->documentsUse = $apiUserInfo['documents_use'];
        }

        if (array_key_exists('keys_quota', $apiUserInfo)) {
            $this->keysQuota = $apiUserInfo['keys_quota'];
        }

        if (array_key_exists('keys_use', $apiUserInfo)) {
            $this->keysUse = $apiUserInfo['keys_use'];
        }

        if (array_key_exists('communities_member', $apiUserInfo)) {
            $this->communitiesMember = $apiUserInfo['communities_member'];
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

    public function getUserName(): string
    {
        return $this->userName;
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
    public function eraseCredentials(): void
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

    /**
     * @return array<mixed>
     */
    public function getCommunitiesMember(): array
    {
        return $this->communitiesMember;
    }

    /**
     * @param array<mixed> $communitiesMember
     */
    public function setCommunitiesMember(array $communitiesMember): self
    {
        $this->communitiesMember = $communitiesMember;

        return $this;
    }

    public function getAccountCreationDate(): ?\DateTimeInterface
    {
        return $this->accountCreationDate;
    }

    public function getLastLoginDate(): ?\DateTimeInterface
    {
        return $this->lastLoginDate;
    }

    public function getDocumentsQuota(): ?int
    {
        return $this->documentsQuota;
    }

    public function getDocumentsUse(): ?int
    {
        return $this->documentsUse;
    }

    public function getKeysQuota(): ?int
    {
        return $this->keysQuota;
    }

    public function getKeysUse(): ?int
    {
        return $this->keysUse;
    }

    public static function getTestUser(): User
    {
        return new User([
            'email' => 'test@test.com',
            'given_name' => 'Test',
            'family_name' => 'User',
            'preferred_username' => 'test_user',
        ], [
            '_id' => 'fc5a7948-142a-4dae-b24e-5550fe7183f9',
            'creation' => '2023-06-26T11:52:25.924679Z',
            'last_login' => '2023-08-01T14:09:41.074381Z',
            'communities_member' => [[
                'rights' => ['ANNEX', 'BROADCAST', 'PROCESSING', 'UPLOAD'],
                'community' => [
                    'name' => 'cartes.gouv - dev',
                    'technical_name' => 'cartes-gouv-dev',
                    'datastore' => '190b714d-daa7-402b-8360-c75baa4c69cc',
                    'supervisor' => '6b3637ed-c1cf-409c-a54c-fb77d4c16ea6',
                    'public' => true,
                    '_id' => 'a0f47300-4c9b-464a-b23f-639ccfa6a673',
                ],
            ]],
            'documents_quota' => 50000000,
            'documents_use' => 0,
            'keys_quota' => 1000,
            'keys_use' => 3,
        ]);
    }
}
