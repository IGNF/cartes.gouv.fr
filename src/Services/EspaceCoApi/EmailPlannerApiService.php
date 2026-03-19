<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class EmailPlannerApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @return array<mixed>
     */
    public function getAll(int $communityId): array
    {
        return $this->api->requestAll("communities/$communityId/emailplanners");
    }

    /**
     * @param array<mixed> $data
     */
    public function add(int $communityId, array $data): PendingResponse
    {
        return $this->api->post("communities/$communityId/emailplanners", $data);
    }

    /**
     * @param array<mixed> $data
     */
    public function update(int $communityId, int $emailPlannerId, array $data): PendingResponse
    {
        return $this->api->put("communities/$communityId/emailplanners/$emailPlannerId", $data);
    }

    public function remove(int $communityId, int $emailPlannerId): PendingResponse
    {
        return $this->api->delete("communities/$communityId/emailplanners/$emailPlannerId");
    }
}
