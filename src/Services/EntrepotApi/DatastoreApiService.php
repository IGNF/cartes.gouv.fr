<?php

namespace App\Services\EntrepotApi;

class DatastoreApiService extends AbstractEntrepotApiService
{
    public function get(string $datastoreId): array
    {
        return $this->request('GET', "datastores/$datastoreId");
    }

    /**
     * @param array<string,mixed> $query
     */
    public function getEndpoints(string $datastoreId, array $query = []): array
    {
        $datastore = $this->get($datastoreId);
        $endpoints = $datastore['endpoints'];

        if (isset($query['type'])) {
            $endpoints = array_filter($endpoints, function ($endpoint) use ($query) {
                if (isset($endpoint['endpoint']['type'])) {
                    return strtoupper($endpoint['endpoint']['type']) === strtoupper($query['type']);
                }

                return false;
            });
        }

        if (isset($query['open'])) {
            $endpoints = array_filter($endpoints, function ($endpoint) use ($query) {
                if (isset($endpoint['endpoint']['open'])) {
                    return $endpoint['endpoint']['open'] === $query['open'];
                }

                return false;
            });
        }

        $endpoints = array_values($endpoints);

        return $endpoints;
    }
}
