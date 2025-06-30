<?php

namespace App\Services\EspaceCoApi;

class GeoserviceApiService extends BaseEspaceCoApiService
{
    /**
     * @param array<string> $fields
     *
     * @return array<mixed>
     */
    public function getGeoservice(int $geoserviceId, ?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->request('GET', "geoservices/$geoserviceId", [], $query);
    }
}
