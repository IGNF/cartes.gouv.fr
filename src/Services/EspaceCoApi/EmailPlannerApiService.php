<?php

namespace App\Services\EspaceCoApi;

class EmailPlannerApiService extends BaseEspaceCoApiService
{
    /**
     * @return array<mixed>
     */
    public function getAll(int $communityId): array
    {
        return $this->requestAll("communities/$communityId/emailplanners");
    }

    /**
     * @param array<mixed> $data
     */
    public function add(int $communityId, array $data): array
    {
        return $this->request('POST', "communities/$communityId/emailplanners", $data);
    }

    /**
     * @param array<mixed> $data
     */
    public function update(int $communityId, int $emailPlannerId, array $data): array
    {
        return $this->request('PUT', "communities/$communityId/emailplanners/$emailPlannerId", $data);
    }

    public function remove(int $communityId, int $emailPlannerId): array
    {
        return $this->request('DELETE', "communities/$communityId/emailplanners/$emailPlannerId");
    }
}
