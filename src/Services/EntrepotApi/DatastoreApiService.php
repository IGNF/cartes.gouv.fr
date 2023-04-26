<?php

namespace App\Services\EntrepotApi;

class DatastoreApiService extends AbstractEntrepotApiService
{
    public function get(string $datastoreId): array
    {
        return $this->request('GET', "datastores/$datastoreId");
    }
}
