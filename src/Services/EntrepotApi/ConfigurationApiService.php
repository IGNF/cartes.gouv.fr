<?php

namespace App\Services\EntrepotApi;

class ConfigurationApiService extends AbstractEntrepotApiService
{
    public function create(string $datastoreId, string $pyramidId, string $name, string $layerName, string $title, string $description, string|int $bottomLevel, string|int $topLevel): array
    {
        $body = [
            'type' => 'WMTS-TMS',
            'name' => $name,
            'layer_name' => $layerName,
            'type_infos' => [
                'title' => $title,
                'abstract' => $description,
                'used_data' => [
                    [
                        'stored_data' => $pyramidId,
                        'bottom_level' => $bottomLevel,
                        'top_level' => $topLevel,
                    ],
                ],
            ],
        ];

        return $this->add($datastoreId, $body);
    }

    // ----------------------------

    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, $query = []): array
    {
        return $this->request('GET', "datastores/$datastoreId/configurations", [], $query);
    }

    public function get(string $datastoreId, string $configurationId): array
    {
        return $this->request('GET', "datastores/$datastoreId/configurations/$configurationId");
    }

    /**
     * Utiliser plutôt la fonction create.
     *
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
     * Récupère toutes les offerings associées à la configuration fournie.
     */
    public function getOfferings(string $datastoreId, string $configurationId): array
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

    public function getOffering(string $datastoreId, string $offeringId): array
    {
        return $this->request('GET', "datastores/$datastoreId/offerings/$offeringId");
    }

    public function addOffering(string $datastoreId, string $configurationId, string $endpointId): array
    {
        $body = [
            'visibility' => 'PUBLIC',
            'endpoint' => $endpointId,
            'open' => true
        ];

        return $this->request('POST', "datastores/$datastoreId/configurations/$configurationId/offerings", $body);
    }

    public function removeOffering(string $datastoreId, string $offeringId): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/offerings/$offeringId");
    }
}
