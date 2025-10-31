<?php

namespace App\Services\EntrepotApi;

class CatalogsApiService extends BaseEntrepotApiService
{
    public function getAllCommunities(): mixed
    {
        return $this->requestAll('catalogs/communities');
    }

    public function getAllOrganizations(): mixed
    {
        return $this->requestAll('catalogs/organizations');
    }
}
