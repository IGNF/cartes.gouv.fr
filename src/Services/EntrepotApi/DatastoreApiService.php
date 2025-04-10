<?php

namespace App\Services\EntrepotApi;

use App\Exception\ApiException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Cache\ItemInterface;

class DatastoreApiService extends BaseEntrepotApiService
{
    public function get(string $datastoreId): array
    {
        return $this->cache->get("datastore-$datastoreId", function (ItemInterface $item) use ($datastoreId) {
            $item->expiresAfter(60);

            return $this->request('GET', "datastores/$datastoreId");
        });
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

        throw new ApiException("Aucun endpoint trouvé avec l'identifiant {$endpointId}", Response::HTTP_NOT_FOUND);
    }

    /**
     * @param array<string,mixed> $query
     */
    public function getPermissions(string $datastoreId, array $query = []): array
    {
        return $this->requestAll("datastores/$datastoreId/permissions", $query);
    }

    public function getPermission(string $datastoreId, string $permissionId): array
    {
        return $this->request('GET', "datastores/$datastoreId/permissions/$permissionId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addPermission(string $datastoreId, array $body): array
    {
        return $this->request('POST', "datastores/$datastoreId/permissions", $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function updatePermission(string $datastoreId, string $permissionId, array $body): array
    {
        return $this->request('PATCH', "datastores/$datastoreId/permissions/$permissionId", $body);
    }

    public function removePermission(string $datastoreId, string $permissionId): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/permissions/$permissionId");
    }
}
