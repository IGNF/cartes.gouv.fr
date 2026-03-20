<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class EmailPlannerApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    public function getAll(int $communityId): PaginatedPromise
    {
        return $this->api->requestAll("communities/$communityId/emailplanners");
    }

    /**
     * @param array<mixed> $data
     */
    public function add(int $communityId, array $data): ResponsePromise
    {
        return $this->api->post("communities/$communityId/emailplanners", $data);
    }

    /**
     * @param array<mixed> $data
     */
    public function update(int $communityId, int $emailPlannerId, array $data): ResponsePromise
    {
        return $this->api->put("communities/$communityId/emailplanners/$emailPlannerId", $data);
    }

    public function remove(int $communityId, int $emailPlannerId): ResponsePromise
    {
        return $this->api->delete("communities/$communityId/emailplanners/$emailPlannerId");
    }
}
