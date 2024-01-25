<?php

namespace App\Services\EntrepotApi;

class ConfigurationApiService extends AbstractEntrepotApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, $query = []): array
    {
        return $this->requestAll("datastores/$datastoreId/configurations", [], $query);
    }

    /**
     * @param mixed[] $query
     */
    public function getAllDetailed(string $datastoreId, array $query = []): array
    {
        $configurations = $this->getAll($datastoreId, $query);

        foreach ($configurations as &$configuration) {
            $configuration = $this->get($datastoreId, $configuration['_id']);
        }

        return $configurations;
    }

    public function get(string $datastoreId, string $configurationId): array
    {
        return $this->request('GET', "datastores/$datastoreId/configurations/$configurationId");
    }

    /**
     * @param array<mixed> $body
     */
    public function add(string $datastoreId, $body = []): array
    {
        return $this->request('POST', "datastores/$datastoreId/configurations", $body);
    }

    public function remove(string $datastoreId, string $configurationId): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/configurations/$configurationId");
    }

    /**
     * @param array<string,string> $tags
     */
    public function addTags(string $datastoreId, string $configurationId, array $tags): array
    {
        return $this->request('POST', "datastores/$datastoreId/configurations/$configurationId/tags", $tags);
    }

    /**
     * @param array<string> $tags
     */
    public function removeTags(string $datastoreId, string $configurationId, array $tags): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/configurations/$configurationId/tags", [], [
            'tags' => $tags,
        ]);
    }

    /**
     * Récupère toutes les offerings associées à la configuration fournie.
     */
    public function getConfigurationOfferings(string $datastoreId, string $configurationId): array
    {
        return $this->requestAll("datastores/$datastoreId/configurations/$configurationId/offerings");
    }

    /**
     * Alias of postCreateOffering.
     */
    public function publish(string $datastoreId, string $configurationId, string $endpointId): array
    {
        return $this->addOffering($datastoreId, $configurationId, $endpointId);
    }

    /**
     * Récupère toutes les offerings du datastore.
     *
     * @param array<mixed> $query
     */
    public function getAllOfferings(string $datastoreId, $query = []): array
    {
        return $this->requestAll("datastores/$datastoreId/offerings", $query);
    }

    /**
     * @param mixed[] $query
     */
    public function getAllOfferingsDetailed(string $datastoreId, array $query = []): array
    {
        $offerings = $this->getAllOfferings($datastoreId, $query);

        foreach ($offerings as &$offering) {
            $offering = $this->getOffering($datastoreId, $offering['_id']);
        }

        return $offerings;
    }

    public function getOffering(string $datastoreId, string $offeringId): array
    {
        return $this->request('GET', "datastores/$datastoreId/offerings/$offeringId");
    }

    public function addOffering(string $datastoreId, string $configurationId, string $endpointId, bool $open = true): array
    {
        $body = [
            // VISIBILITY va disparaître
            'endpoint' => $endpointId,
            'open' => $open,
        ];

        return $this->request('POST', "datastores/$datastoreId/configurations/$configurationId/offerings", $body);
    }

    public function removeOffering(string $datastoreId, string $offeringId): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/offerings/$offeringId");
    }
}
