<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class CommunityLayerApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $fields
     */
    public function getLayers(int $communityId, ?array $fields = []): PaginatedPromise
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->requestAll("communities/$communityId/layers", $query);
    }
}
