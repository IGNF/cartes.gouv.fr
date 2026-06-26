<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\ResponsePromise;
use App\Exception\ApiException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

final class DatastoreApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $api,
        private readonly CacheInterface $cache,
    ) {
    }

    public function get(string $datastoreId): array
    {
        return $this->cache->get("datastore-$datastoreId", function (ItemInterface $item) use ($datastoreId) {
            $item->expiresAfter(120);

            return $this->api->get("datastores/$datastoreId")->array();
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
    public function getPermissions(string $datastoreId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAll("datastores/$datastoreId/permissions", $query);
    }

    public function getPermission(string $datastoreId, string $permissionId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/permissions/$permissionId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addPermission(string $datastoreId, array $body): ResponsePromise
    {
        return $this->api->post("datastores/$datastoreId/permissions", $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function updatePermission(string $datastoreId, string $permissionId, array $body): ResponsePromise
    {
        return $this->api->patch("datastores/$datastoreId/permissions/$permissionId", $body);
    }

    public function removePermission(string $datastoreId, string $permissionId): ResponsePromise
    {
        return $this->api->delete("datastores/$datastoreId/permissions/$permissionId");
    }

    /**
     * @param array<string,mixed> $query
     */
    public function getPermissionStats(string $datastoreId, string $permissionId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAll("datastores/$datastoreId/permissions/$permissionId/stats", $query);
    }

    /**
     * @param array<string,mixed> $query
     */
    public function getEndpointStats(string $datastoreId, string $endpointId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAll("datastores/$datastoreId/endpoints/$endpointId/stats", $query);
    }
}
