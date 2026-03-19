<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
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
     *
     * @return array<mixed>
     */
    public function getLayers(int $communityId, ?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->requestAll("communities/$communityId/layers", $query);
    }
}
