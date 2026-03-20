<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\ResponsePromise;
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
    public function getGeoservice(int $geoserviceId, ?array $fields = []): ResponsePromise
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->get("geoservices/$geoserviceId", $query);
    }
}
