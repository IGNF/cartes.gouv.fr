<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class CatalogsApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $api,
    ) {
    }

    public function getAllCommunities(): PaginatedPromise
    {
        return $this->api->requestAll('catalogs/communities');
    }

    public function getAllOrganizations(): PaginatedPromise
    {
        return $this->api->requestAll('catalogs/organizations');
    }
}
