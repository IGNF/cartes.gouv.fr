<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\PaginatedResponse;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;

final class StaticApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        public readonly ApiClient $api,
        private readonly Filesystem $filesystem,
    ) {
    }

    /**
     * @param array<mixed> $query
     */
    public function getList(string $datastoreId, array $query = []): PaginatedResponse
    {
        return $this->api->get("datastores/$datastoreId/statics", $query)->arrayWithHeaders();
    }

    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): PaginatedPromise
    {
        return $this->api->requestAll("datastores/$datastoreId/statics", $query);
    }

    public function get(string $datastoreId, string $staticId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/statics/$staticId");
    }

    public function add(string $datastoreId, string $filepath, string $name, string $type, ?string $description = null): array
    {
        $formFields = [
            'type' => $type,
            'name' => $name,
        ];

        if ($description) {
            $formFields['description'] = $description;
        }

        $response = $this->api->sendFile('POST', "datastores/$datastoreId/statics", $filepath, $formFields)->array();

        $this->filesystem->remove($filepath);

        return $response;
    }

    public function replaceFile(string $datastoreId, string $staticId, string $filepath): array
    {
        $response = $this->api->sendFile('PUT', "datastores/$datastoreId/statics/$staticId", $filepath)->array();

        $this->filesystem->remove($filepath);

        return $response;
    }

    public function delete(string $datastoreId, string $staticId): ResponsePromise
    {
        return $this->api->delete("datastores/$datastoreId/statics/$staticId");
    }

    /**
     * @param array<mixed> $body
     */
    public function modifyInfo(string $datastoreId, string $staticId, array $body): ResponsePromise
    {
        return $this->api->patch("datastores/$datastoreId/statics/$staticId", $body);
    }

    public function downloadFile(string $datastoreId, string $staticId): ResponsePromise
    {
        return $this->api->get("datastores/$datastoreId/statics/$staticId/file");
    }
}
