<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;

final class MetadataApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $api,
        private readonly Filesystem $filesystem,
    ) {
    }

    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAll("datastores/$datastoreId/metadata", $query);
    }

    public function get(string $datastoreId, string $metadataId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/metadata/$metadataId");
    }

    public function add(string $datastoreId, string $filepath, ?string $type = 'ISOAP', ?bool $openData = false): array
    {
        $response = $this->api->sendFile('POST', "datastores/$datastoreId/metadata", $filepath, [], [
            'type' => $type,
            'open_data' => $openData,
        ])->array();

        $this->filesystem->remove($filepath);

        return $response;
    }

    public function replaceFile(string $datastoreId, string $metadataId, string $filepath): array
    {
        $response = $this->api->sendFile('PUT', "datastores/$datastoreId/metadata/$metadataId", $filepath)->array();

        $this->filesystem->remove($filepath);

        return $response;
    }

    public function modifyInfo(string $datastoreId, string $metadataId, ?string $type = 'ISOAP', ?bool $openData = false): ResponsePromise
    {
        return $this->api->patch("datastores/$datastoreId/metadata/$metadataId", [
            'type' => $type,
            'open_data' => $openData,
        ]);
    }

    public function delete(string $datastoreId, string $metadataId): ResponsePromise
    {
        return $this->api->delete("datastores/$datastoreId/metadata/$metadataId");
    }

    public function downloadFile(string $datastoreId, string $metadataId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/metadata/$metadataId/file");
    }

    /**
     * @param array<string,string> $tags
     */
    public function addTags(string $datastoreId, string $metadataId, array $tags): ResponsePromise
    {
        return $this->api->post("datastores/$datastoreId/metadata/$metadataId/tags", $tags);
    }

    /**
     * @param array<string> $tags
     */
    public function removeTags(string $datastoreId, string $metadataId, array $tags): ResponsePromise
    {
        return $this->api->delete("datastores/$datastoreId/metadata/$metadataId/tags", ['tags' => $tags]);
    }

    public function publish(string $datastoreId, string $fileIdentifier, string $endpointId): ResponsePromise
    {
        return $this->api->post("datastores/{$datastoreId}/metadata/publication", [
            'file_identifiers' => [$fileIdentifier],
            'endpoint' => $endpointId,
        ]);
    }

    public function unpublish(string $datastoreId, string $fileIdentifier, string $endpointId): ResponsePromise
    {
        return $this->api->post("datastores/{$datastoreId}/metadata/unpublication", [
            'file_identifiers' => [$fileIdentifier],
            'endpoint' => $endpointId,
        ]);
    }
}
