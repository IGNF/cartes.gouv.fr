<?php

namespace App\Services\EspaceCoApi;

class WfsApiService extends BaseEspaceCoApiService
{
    /**
     * @param array<mixed> $query
     */
    public function wfsRequest(array $query = [], ?string $databaseName = null): string
    {
        $url = $databaseName ? "wfs/$databaseName" : 'wfs';

        return $this->request('GET', $url, [], $query, [], false, false, false);
    }
}
