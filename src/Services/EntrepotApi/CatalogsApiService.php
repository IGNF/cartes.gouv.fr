<?php

namespace App\Services\EntrepotApi;

class CatalogsApiService extends BaseEntrepotApiService
{
    public function getAllPublicCommunities(): mixed
    {
        return $this->requestAll('catalogs/communities');
    }
}
