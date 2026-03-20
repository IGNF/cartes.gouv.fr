<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedPromise;
use App\ApiClient\PaginatedResponse;
use App\ApiClient\ResponsePromise;
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

        return $this->api->get('reports', $query)->arrayWithHeaders();
    }

    /**
     * @param array<mixed> $query
     */
    public function getAll(array $query = []): PaginatedPromise
    {
        return $this->api->requestAll('reports', $query);
    }

    /**
     * @param array<mixed> $body
     */
    public function add(array $body): ResponsePromise
    {
        return $this->api->post('reports', $body);
    }

    /**
     * @param array<mixed> $fields
     */
    public function get(string $reportId, $fields = []): ResponsePromise
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
    public function replace(string $reportId, array $body): ResponsePromise
    {
        return $this->api->put("reports/$reportId", $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function modify(string $reportId, array $body): ResponsePromise
    {
        return $this->api->patch("reports/$reportId", $body);
    }

    public function delete(string $reportId): ResponsePromise
    {
        return $this->api->delete("reports/$reportId");
    }

    /**
     * @param array<string,string> $files
     */
    public function addAttachments(string $reportId, array $files): ResponsePromise
    {
        return $this->api->sendFiles('POST', "reports/$reportId/attachments", $files);
    }

    public function deleteAttachment(string $reportId, string $attachmentId): ResponsePromise
    {
        return $this->api->delete("reports/$reportId/attachments/$attachmentId");
    }

    public function getRss(): ResponsePromise
    {
        return $this->api->get('reports/rss');
    }

    /**
     * @param array<mixed> $query
     */
    public function getWfs(array $query = []): ResponsePromise
    {
        return $this->api->get('reports/wfs', $query);
    }
}
