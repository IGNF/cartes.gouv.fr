<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class GeoserviceApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<string> $fields
     */
    public function getGeoservice(int $geoserviceId, ?array $fields = []): PendingResponse
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->get("geoservices/$geoserviceId", $query);
    }
}
