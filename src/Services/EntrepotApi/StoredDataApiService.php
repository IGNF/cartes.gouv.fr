<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedResponse;
use App\ApiClient\PendingResponse;
use App\Utils;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class StoredDataApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed>|null $query
     */
    public function getList(string $datastoreId, ?array $query = []): PaginatedResponse
    {
        $query = Utils::normalize_query($query ?? []);

        return $this->api->get("datastores/$datastoreId/stored_data", $query)
            ->jsonWithHeaders();
    }

    /**
     * @param array<mixed>|null $query
     */
    public function getListDetailed(string $datastoreId, ?array $query = []): PaginatedResponse
    {
        $page = $this->getList($datastoreId, $query);
        $detailed = $this->api->fetchAllDetailsAsync(
            $page->content,
            fn (array $storedData): PendingResponse => $this->api->get("datastores/$datastoreId/stored_data/{$storedData['_id']}")
        );

        return new PaginatedResponse($detailed, $page->headers);
    }

    /**
     * @param array<mixed> $query
     *
     * @return array<mixed>
     */
    public function getAll(string $datastoreId, array $query = []): array
    {
        $query = Utils::normalize_query($query);

        return $this->api->requestAll("datastores/$datastoreId/stored_data", $query);
    }

    /**
     * @param array<mixed> $query
     *
     * @return array<mixed>
     */
    public function getAllDetailed(string $datastoreId, array $query = []): array
    {
        $storedDataList = $this->getAll($datastoreId, $query);

        return $this->api->fetchAllDetailsAsync(
            $storedDataList,
            fn (array $storedData): PendingResponse => $this->api->get("datastores/$datastoreId/stored_data/{$storedData['_id']}")
        );
    }

    public function get(string $datastoreId, string $storedDataId): PendingResponse
    {
        return $this->api->get("datastores/$datastoreId/stored_data/$storedDataId");
    }

    /**
     * @param array<mixed>      $body
     * @param array<mixed>|null $initialStoredData
     */
    public function modify(string $datastoreId, string $storedDataId, array $body = [], ?array $initialStoredData = null): PendingResponse
    {
        if (array_key_exists('extra', $body)) {
            $initialStoredData ??= $this->get($datastoreId, $storedDataId)->json();
            $body['extra'] = array_merge($initialStoredData['extra'] ?? [], $body['extra']);
        }

        return $this->api->patch("datastores/$datastoreId/stored_data/$storedDataId", $body);
    }

    public function remove(string $datastoreId, string $storedDataId): PendingResponse
    {
        return $this->api->delete("datastores/$datastoreId/stored_data/$storedDataId");
    }

    /**
     * @param array<mixed> $tags
     */
    public function addTags(string $datastoreId, string $storedDataId, array $tags): PendingResponse
    {
        return $this->api->post("datastores/$datastoreId/stored_data/$storedDataId/tags", $tags);
    }

    /**
     * @param array<string> $tags
     */
    public function removeTags(string $datastoreId, string $storedDataId, array $tags): PendingResponse
    {
        return $this->api->delete("datastores/$datastoreId/stored_data/$storedDataId/tags", ['tags' => $tags]);
    }
}
