<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final readonly class WfsApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $query
     */
    public function wfsRequest(array $query = [], ?string $databaseName = null): ResponsePromise
    {
        $url = $databaseName ? "wfs/$databaseName" : 'wfs';

        return $this->api->get($url, $query);
    }
}
