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

final readonly class DatastoreApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private ApiClient $api,
        private CacheInterface $cache,
    ) {
    }

    /**
     * Cache commun à tous les utilisateurs : réservé aux appelants internes qui interrogent aussi l'Entrepôt avec le jeton de l'utilisateur dans la même requête.
     * Une route qui renvoie l'entrepôt vérifie d'abord l'appartenance (MembershipService::isMemberOfDatastoreNow), sinon fetch().
     *
     * @return array<mixed>
     */
    public function get(string $datastoreId): array
    {
        return $this->cache->get("datastore-$datastoreId", function (ItemInterface $item) use ($datastoreId) {
            $item->expiresAfter(120);

            return $this->fetch($datastoreId);
        });
    }

    /**
     * Sans cache : l'Entrepôt répond ou refuse avec le jeton de l'utilisateur.
     *
     * @return array<mixed>
     */
    public function fetch(string $datastoreId): array
    {
        return $this->api->get("datastores/$datastoreId")->array();
    }

    public function invalidate(string $datastoreId): void
    {
        $this->cache->delete("datastore-$datastoreId");
    }

    /**
     * Sans cache : la lecture du datastore complet prend 12 s, celle-ci 0,1 s, avec le jeton de l'utilisateur.
     *
     * @param array<string,mixed> $query
     *
     * @return array<mixed>
     */
    public function getEndpointsList(string $datastoreId, array $query = []): array
    {
        return $this->filterEndpoints($this->api->requestAll("datastores/$datastoreId/endpoints")->resolve(), $query);
    }

    /**
     * @param array<mixed>        $endpoints
     * @param array<string,mixed> $query
     *
     * @return array<mixed>
     */
    private function filterEndpoints(array $endpoints, array $query = []): array
    {
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

        return array_values($endpoints);
    }

    /**
     * @return array<mixed>
     */
    public function getEndpoint(string $datastoreId, string $endpointId): array
    {
        return self::findEndpoint($this->getEndpointsList($datastoreId), $endpointId);
    }

    /**
     * Recherche dans une liste déjà lue par getEndpointsList, pour une seule lecture par requête.
     *
     * @param array<mixed> $endpoints
     *
     * @return array<mixed>
     */
    public static function findEndpoint(array $endpoints, string $endpointId): array
    {
        $filteredEndpoints = array_filter($endpoints, function ($endpoint) use ($endpointId) {
            return $endpoint['endpoint']['_id'] === $endpointId;
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
        return $this->api->requestAllHitStatistics("datastores/$datastoreId/permissions/$permissionId/stats", $query);
    }

    /**
     * @param array<string,mixed> $query
     */
    public function getEndpointStats(string $datastoreId, string $endpointId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAllHitStatistics("datastores/$datastoreId/endpoints/$endpointId/stats", $query);
    }
}
