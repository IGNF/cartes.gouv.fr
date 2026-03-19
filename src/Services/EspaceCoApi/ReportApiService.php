<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedResponse;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class ReportApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $query
     */
    public function getList(int $page = 1, int $limit = 10, array $query = []): PaginatedResponse
    {
        $query['page'] = $page;
        $query['limit'] = $limit;

        return $this->api->get('reports', $query)->jsonWithHeaders();
    }

    /**
     * @param array<mixed> $query
     */
    public function getAll(array $query = []): array
    {
        return $this->api->requestAll('reports', $query);
    }

    /**
     * @param array<mixed> $body
     */
    public function add(array $body): PendingResponse
    {
        return $this->api->post('reports', $body);
    }

    /**
     * @param array<mixed> $fields
     */
    public function get(string $reportId, $fields = []): PendingResponse
    {
        $query = [];
        if (count($fields)) {
            $query['fields'] = $fields;
        }

        return $this->api->get("reports/$reportId", $query);
    }

    /**
     * @param array<mixed> $body
     */
    public function replace(string $reportId, array $body): PendingResponse
    {
        return $this->api->put("reports/$reportId", $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function modify(string $reportId, array $body): PendingResponse
    {
        return $this->api->patch("reports/$reportId", $body);
    }

    public function delete(string $reportId): PendingResponse
    {
        return $this->api->delete("reports/$reportId");
    }

    /**
     * @param array<string,string> $files
     */
    public function addAttachments(string $reportId, array $files): PendingResponse
    {
        return $this->api->sendFiles('POST', "reports/$reportId/attachments", $files);
    }

    public function deleteAttachment(string $reportId, string $attachmentId): PendingResponse
    {
        return $this->api->delete("reports/$reportId/attachments/$attachmentId");
    }

    public function getRss(): PendingResponse
    {
        return $this->api->get('reports/rss');
    }

    /**
     * @param array<mixed> $query
     */
    public function getWfs(array $query = []): PendingResponse
    {
        return $this->api->get('reports/wfs', $query);
    }
}
