<?php

namespace App\Services\EntrepotApi;

class MetadataApiService extends BaseEntrepotApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): array
    {
        return $this->requestAll("datastores/$datastoreId/metadata", $query);
    }

    public function get(string $datastoreId, string $metadataId): array
    {
        return $this->request('GET', "datastores/$datastoreId/metadata/$metadataId");
    }

    public function add(string $datastoreId, string $filepath, ?string $type = 'ISOAP', ?bool $openData = false): array
    {
        $response = $this->sendFile('POST', "datastores/$datastoreId/metadata", $filepath, [], [
            'type' => $type,
            'open_data' => $openData,
        ]);

        $this->filesystem->remove($filepath);

        return $response;
    }

    public function replaceFile(string $datastoreId, string $metadataId, string $filepath): array
    {
        $response = $this->sendFile('PUT', "datastores/$datastoreId/metadata/$metadataId", $filepath);

        $this->filesystem->remove($filepath);

        return $response;
    }

    public function modifyInfo(string $datastoreId, string $metadataId, ?string $type = 'ISOAP', ?bool $openData = false): array
    {
        return $this->request('PATCH', "datastores/$datastoreId/metadata/$metadataId", [
            'type' => $type,
            'open_data' => $openData,
        ]);
    }

    public function delete(string $datastoreId, string $metadataId): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/metadata/$metadataId");
    }

    public function downloadFile(string $datastoreId, string $metadataId): string
    {
        return $this->request('GET', "datastores/$datastoreId/metadata/$metadataId/file", [], [], [], false, false);
    }

    /**
     * @param array<string,string> $tags
     */
    public function addTags(string $datastoreId, string $metadataId, array $tags): array
    {
        return $this->request('POST', "datastores/$datastoreId/metadata/$metadataId/tags", $tags);
    }

    /**
     * @param array<string> $tags
     */
    public function removeTags(string $datastoreId, string $metadataId, array $tags): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/metadata/$metadataId/tags", [], [
            'tags' => $tags,
        ]);
    }

    public function publish(string $datastoreId, string $fileIdentifier, string $endpointId): array
    {
        return $this->request('POST', "datastores/{$datastoreId}/metadata/publication", [
            'file_identifiers' => [$fileIdentifier],
            'endpoint' => $endpointId,
        ]);
    }

    public function unpublish(string $datastoreId, string $fileIdentifier, string $endpointId): array
    {
        return $this->request('POST', "datastores/{$datastoreId}/metadata/unpublication", [
            'file_identifiers' => [$fileIdentifier],
            'endpoint' => $endpointId,
        ]);
    }
}
