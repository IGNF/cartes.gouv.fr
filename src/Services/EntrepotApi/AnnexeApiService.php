<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\PaginatedResponse;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;

final class AnnexeApiService
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
    public function getList(string $datastoreId, array $query = []): PaginatedResponse
    {
        return $this->api->get("datastores/$datastoreId/annexes", $query)->arrayWithHeaders();
    }

    /**
     * @param array<string> $labels
     */
    public function getAll(string $datastoreId, ?string $mimeType = null, ?string $path = null, ?array $labels = null): PaginatedPromise
    {
        $query = [];
        if ($mimeType) {
            $query['mime_type'] = $mimeType;
        }
        if ($path) {
            $query['path'] = $path;
        }
        if ($labels) {
            $query['labels'] = $labels;
        }

        return $this->api->requestAll("datastores/$datastoreId/annexes", $query);
    }

    public function get(string $datastoreId, string $annexeId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/annexes/$annexeId");
    }

    /**
     * @param array<string> $paths
     * @param array<string> $labels
     */
    public function add(string $datastoreId, string $annexeFilePath, array $paths, ?array $labels = null, bool $published = true): array
    {
        $response = $this->api->sendFile('POST', "datastores/$datastoreId/annexes", $annexeFilePath, [
            'published' => true === $published ? 'true' : 'false',
            'paths' => join(',', $paths), // ici on fait un join parce que c'est un FormData, qui ne gère pas bien les virgules
        ])->array();

        if (null !== $labels) {
            $response = $this->modify($datastoreId, $response['_id'], null, $labels, null)->array();
        }

        $this->filesystem->remove($annexeFilePath);

        return $response;
    }

    /**
     * @param array<string> $paths
     * @param array<string> $labels
     */
    public function modify(string $datastoreId, string $annexeId, ?array $paths = null, ?array $labels = null, ?bool $published = null): ResponsePromise
    {
        $body = [];

        if (null !== $paths) {
            $body['paths'] = $paths;
        }

        if (null !== $labels) {
            $body['labels'] = $labels;
        }

        if (null !== $published) {
            $body['published'] = true === $published ? 'true' : 'false';
        }

        return $this->api->patch("datastores/$datastoreId/annexes/$annexeId", $body);
    }

    public function replaceFile(string $datastoreId, string $annexeId, string $annexeFilePath): array
    {
        $response = $this->api->sendFile('PUT', "datastores/$datastoreId/annexes/$annexeId", $annexeFilePath)->array();

        $this->filesystem->remove($annexeFilePath);

        return $response;
    }

    public function publish(string $datastoreId, string $annexeId): ResponsePromise
    {
        return $this->api->patch("datastores/$datastoreId/annexes/$annexeId", [
            'published' => true,
        ]);
    }

    public function remove(string $datastoreId, string $annexeId): ResponsePromise
    {
        return $this->api->delete("datastores/$datastoreId/annexes/$annexeId");
    }

    public function download(string $datastoreId, string $annexeId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/annexes/$annexeId/file");
    }
}
