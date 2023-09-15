<?php

namespace App\Services\EntrepotApi;

class MetadataApi extends AbstractEntrepotApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): array
    {
        return $this->request('GET', "datastores/$datastoreId/metadata", [], $query);
    }

    public function get(string $datastoreId, string $metadataId): array
    {
        return $this->request('GET', "datastores/$datastoreId/metadata/$metadataId");
    }

    public function add(string $datastoreId, string $filepath, string $type): array
    {
        return $this->postFile("datastores/$datastoreId/metadata", $filepath, [
            'type' => $type,
        ]);
    }

    public function replaceFile(string $datastoreId, string $metadataId, string $filepath): array
    {
        return $this->postFile("datastores/$datastoreId/metadata/$metadataId", $filepath);
    }

    /**
     * @param array<mixed> $body
     */
    public function modifyInfo(string $datastoreId, string $metadataId, array $body): array
    {
        return $this->request('PATCH', "datastores/$datastoreId/metadata/$metadataId", $body);
    }

    public function delete(string $datastoreId, string $metadataId): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/metadata/$metadataId");
    }

    public function downloadFile(string $datastoreId, string $metadataId): array
    {
        return $this->request('GET', "datastores/$datastoreId/metadata/$metadataId/file");
    }

    public function publish(string $datastoreId, string $metadataId): array
    {
        return $this->request('POST', "datastores/$datastoreId/metadata/$metadataId/publication");
    }

    public function unpublish(string $datastoreId, string $metadataId): array
    {
        return $this->request('POST', "datastores/$datastoreId/metadata/$metadataId/unpublication");
    }
}
