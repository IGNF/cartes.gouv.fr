<?php

namespace App\Services\EntrepotApi;

class CatalogsApiService extends AbstractEntrepotApiService
{
    public function getAllPublicCommunities(): mixed
    {
        return $this->requestAll('catalogs/communities');
    }
}
