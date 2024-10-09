<?php

namespace App\Services\EspaceCoApi;

class UserApiService extends BaseEspaceCoApiService
{
    public function getMe(): array
    {
        return $this->request('GET', 'users/me');
    }

    public function getSharedThemes(): array
    {
        $result = $this->request('GET', 'users/me', [], ['fields' => 'shared_themes']);
        if (is_array($result) && array_key_exists('shared_themes', $result)) {
            return $result['shared_themes'];
        }

        return [];
    }

    public function getUser(int $userId): array
    {
        return $this->request('GET', "users/$userId");
    }
}
