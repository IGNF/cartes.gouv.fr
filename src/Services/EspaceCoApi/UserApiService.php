<?php

namespace App\Services\EspaceCoApi;

class UserApiService extends BaseEspaceCoApiService
{
    public function getMe(): array
    {
        return $this->request('GET', 'users/me');
    }
}
