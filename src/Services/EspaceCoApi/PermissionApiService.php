<?php

namespace App\Services\EspaceCoApi;

class PermissionApiService extends BaseEspaceCoApiService
{
    public function getAllByCommunity(int $communityId): array
    {
        return $this->requestAll('permissions', ['group' => $communityId]);
    }
}
