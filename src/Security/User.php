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

    /** @var array<string,mixed> */
    private array $communitiesMember = [];

    private \DateTimeInterface $accountCreationDate;
    private \DateTimeInterface $lastApiCallDate;

    /**
     * @param array<mixed> $keycloakUserInfo
     * @param array<mixed> $apiUserInfo
     */
    public function __construct(array $keycloakUserInfo = [], array $apiUserInfo = [])
    {
        $this->email = $keycloakUserInfo['email'];
        $this->id = $apiUserInfo['_id'];
        $this->firstName = $keycloakUserInfo['given_name'];
        $this->lastName = $keycloakUserInfo['family_name'];

        $this->accountCreationDate = new \DateTime($apiUserInfo['creation']);
        $this->lastApiCallDate = new \DateTime($apiUserInfo['last_call']);

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

    public function getAccountCreationDate(): ?\DateTimeInterface
    {
        return $this->accountCreationDate;
    }

    public function getLastApiCallDate(): ?\DateTimeInterface
    {
        return $this->lastApiCallDate;
    }

    public static function getTestUser(): User
    {
        return new User([
            'email' => 'test@test.com',
            'given_name' => 'Test',
            'family_name' => 'User',
        ], [
            '_id' => 'fc5a7948-142a-4dae-b24e-5550fe7183f9',
            'creation' => '2023-06-26T11:52:25.924679Z',
            'last_call' => '2023-08-01T14:09:41.074381Z',
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
        ]);
    }
}
