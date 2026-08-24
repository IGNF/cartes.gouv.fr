<?php

namespace App\Security;

use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Ignore;

class User implements UserInterface
{
    private string $email;
    private string $userName;
    private string $id;
    private ?string $keycloakId;

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
        $this->keycloakId = $keycloakUserInfo['sub'] ?? null;
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

    #[Ignore]
    public function getKeycloakId(): ?string
    {
        return $this->keycloakId;
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
     * `community.datastore` est un id string dans users/me, absent si la communauté n'a pas de datastore.
     *
     * @return array<mixed>|null
     */
    public function findMembershipByDatastore(string $datastoreId): ?array
    {
        foreach ($this->communitiesMember as $member) {
            if (($member['community']['datastore'] ?? null) === $datastoreId) {
                return $member;
            }
        }

        return null;
    }

    /**
     * @return array<mixed>|null
     */
    public function findMembershipByCommunity(string $communityId): ?array
    {
        foreach ($this->communitiesMember as $member) {
            if (($member['community']['_id'] ?? null) === $communityId) {
                return $member;
            }
        }

        return null;
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

    /**
     * @param array<mixed> $apiUserInfo
     */
    public function updateFromApiInfo(array $apiUserInfo): self
    {
        if (array_key_exists('communities_member', $apiUserInfo)) {
            $this->communitiesMember = $apiUserInfo['communities_member'];
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

        return $this;
    }
}
