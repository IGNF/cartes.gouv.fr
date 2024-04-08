<?php

namespace App\Services\EntrepotApi;

use App\Exception\EntrepotApiException;
use Symfony\Component\HttpFoundation\Response;

class DatastoreApiService extends AbstractEntrepotApiService
{
    public function get(string $datastoreId): array
    {
        return $this->request('GET', "datastores/$datastoreId");
    }

    /**
     * @param array<string,mixed> $query
     */
    public function getEndpointsList(string $datastoreId, array $query = []): array
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

    public function getEndpoint(string $datastoreId, string $endpointId): array
    {
        $endpoints = $this->getEndpointsList($datastoreId);

        $filteredEndpoints = array_filter($endpoints, function ($endpoint) use ($endpointId) {
            if ($endpoint['endpoint']['_id'] === $endpointId) {
                return true;
            }

            return false;
        });

        $filteredEndpoints = array_values($filteredEndpoints);

        if (count($filteredEndpoints) > 0) {
            return $filteredEndpoints[0];
        }

        throw new EntrepotApiException("Aucun endpoint trouvé avec l'identifiant {$endpointId}", Response::HTTP_NOT_FOUND);
    }

    /**
     * @param array<string,mixed> $query
     */
    public function getPermissions(string $datastoreId, array $query = []): array
    {
        return $this->requestAll("datastores/$datastoreId/permissions", $query);
    }
}
