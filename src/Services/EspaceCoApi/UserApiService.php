<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class UserApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    public function getMe(): ResponsePromise
    {
        return $this->api->get('users/me');
    }

    public function getSharedThemes(): array
    {
        $result = $this->api->get('users/me', ['fields' => 'shared_themes'])->array();
        if (array_key_exists('shared_themes', $result)) {
            return $result['shared_themes'];
        }

        return [];
    }

    /**
     * @param array<mixed> $query
     */
    public function getUser(int $userId, array $query = []): ResponsePromise
    {
        return $this->api->get("users/$userId", $query);
    }

    public function search(string $search): ResponsePromise
    {
        return $this->api->get('users', ['search' => $search, 'fields' => ['id', 'username', 'firstname', 'surname']]);
    }
}
