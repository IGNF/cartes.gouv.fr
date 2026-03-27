<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class ConfigurationApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, $query = []): PaginatedPromise
    {
        if (array_key_exists('fields', $query) && is_array($query['fields']) && !empty($query['fields'])) {
            $query['fields'] = implode(',', $query['fields']);
        }

        return $this->api->requestAll("datastores/$datastoreId/configurations", $query);
    }

    /**
     * @param mixed[] $query
     */
    public function getAllDetailed(string $datastoreId, array $query = []): array
    {
        $configurations = $this->getAll($datastoreId, $query)->resolve();

        return $this->api->fetchAllDetailsAsync(
            $configurations,
            fn (array $configuration): ResponsePromise => $this->get($datastoreId, $configuration['_id'])
        );
    }

    public function get(string $datastoreId, string $configurationId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/configurations/$configurationId");
    }

    /**
     * @param array<mixed> $body
     */
    public function add(string $datastoreId, $body = []): ResponsePromise
    {
        return $this->api->post("datastores/$datastoreId/configurations", $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function replace(string $datastoreId, string $configurationId, $body = []): ResponsePromise
    {
        return $this->api->put("datastores/$datastoreId/configurations/$configurationId", $body);
    }

    /**
     * @param array<mixed>      $body
     * @param array<mixed>|null $initialConfiguration
     */
    public function modify(string $datastoreId, string $configurationId, $body = [], ?array $initialConfiguration = null): ResponsePromise
    {
        if (array_key_exists('extra', $body)) {
            $initialConfiguration ??= $this->get($datastoreId, $configurationId)->array();
            $body['extra'] = array_merge($initialConfiguration['extra'] ?? [], $body['extra']);
        }

        return $this->api->patch("datastores/$datastoreId/configurations/$configurationId", $body);
    }

    public function remove(string $datastoreId, string $configurationId): ResponsePromise
    {
        return $this->api->delete("datastores/$datastoreId/configurations/$configurationId");
    }

    /**
     * @param array<string,string> $tags
     */
    public function addTags(string $datastoreId, string $configurationId, array $tags): ResponsePromise
    {
        return $this->api->post("datastores/$datastoreId/configurations/$configurationId/tags", $tags);
    }

    /**
     * @param array<string> $tags
     */
    public function removeTags(string $datastoreId, string $configurationId, array $tags): ResponsePromise
    {
        return $this->api->delete("datastores/$datastoreId/configurations/$configurationId/tags", ['tags' => $tags]);
    }

    /**
     * Récupère toutes les offerings associées à la configuration fournie.
     */
    public function getConfigurationOfferings(string $datastoreId, string $configurationId): PaginatedPromise
    {
        return $this->api->requestAll("datastores/$datastoreId/configurations/$configurationId/offerings");
    }

    /**
     * Alias of postCreateOffering.
     */
    public function publish(string $datastoreId, string $configurationId, string $endpointId): ResponsePromise
    {
        return $this->addOffering($datastoreId, $configurationId, $endpointId);
    }

    /**
     * Récupère toutes les offerings du datastore.
     *
     * @param array<mixed> $query
     */
    public function getAllOfferings(string $datastoreId, $query = []): PaginatedPromise
    {
        return $this->api->requestAll("datastores/$datastoreId/offerings", $query);
    }

    /**
     * @param mixed[] $query
     */
    public function getAllOfferingsDetailed(string $datastoreId, array $query = []): PaginatedPromise
    {
        return $this->getAllOfferings($datastoreId, [
            ...$query,
            'fields' => 'open,available,layer_name,type,status,endpoint,configuration,urls,creation,extra,update,public_activity', // tous les attributs sont présents, donc pas besoin de GET détaillé pour chaque offering
        ]);
    }

    public function getOffering(string $datastoreId, string $offeringId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/offerings/$offeringId");
    }

    public function addOffering(string $datastoreId, string $configurationId, string $endpointId, bool $open = true): ResponsePromise
    {
        $body = [
            // VISIBILITY va disparaître
            'endpoint' => $endpointId,
            'open' => $open,
        ];

        return $this->api->post("datastores/$datastoreId/configurations/$configurationId/offerings", $body);
    }

    public function syncOffering(string $datastoreId, string $offeringId): ResponsePromise
    {
        return $this->api->put("datastores/$datastoreId/offerings/$offeringId");
    }

    public function removeOffering(string $datastoreId, string $offeringId): ResponsePromise
    {
        return $this->api->delete("datastores/$datastoreId/offerings/$offeringId");
    }
}
