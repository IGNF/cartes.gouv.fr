<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class UserApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    public function getMe(): PendingResponse
    {
        return $this->api->get('users/me');
    }

    public function getSharedThemes(): array
    {
        $result = $this->api->get('users/me', ['fields' => 'shared_themes'])->json();
        if (array_key_exists('shared_themes', $result)) {
            return $result['shared_themes'];
        }

        return [];
    }

    /**
     * @param array<mixed> $query
     */
    public function getUser(int $userId, array $query = []): PendingResponse
    {
        return $this->api->get("users/$userId", $query);
    }

    public function search(string $search): PendingResponse
    {
        return $this->api->get('users', ['search' => $search, 'fields' => ['id', 'username', 'firstname', 'surname']]);
    }
}
