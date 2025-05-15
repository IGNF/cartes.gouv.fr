<?php

namespace App\Services\EspaceCoApi;

use Symfony\Component\HttpFoundation\File\UploadedFile;

class ReportApiService extends BaseEspaceCoApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getList(int $page = 1, int $limit = 10, array $query = []): array
    {
        $query['page'] = $page;
        $query['limit'] = $limit;

        return $this->request('GET', 'reports', [], $query, [], false, true, true);
    }

    /**
     * @param array<mixed> $query
     */
    public function getAll(array $query = []): array
    {
        return $this->requestAll('reports', $query);
    }

    /**
     * @param array<mixed> $body
     */
    public function add(array $body): array
    {
        return $this->request('POST', 'reports', $body);
    }

    /**
     * @param array<mixed> $fields
     */
    public function get(string $reportId, $fields = []): array
    {
        $query = [];
        if (count($fields)) {
            $query['fields'] = $fields;
        }

        return $this->request('GET', "reports/$reportId", [], $query);
    }

    /**
     * @param array<mixed> $body
     */
    public function replace(string $reportId, array $body): array
    {
        return $this->request('PUT', "reports/$reportId", $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function modify(string $reportId, array $body): array
    {
        return $this->request('PATCH', "reports/$reportId", $body);
    }

    public function delete(string $reportId): array
    {
        return $this->request('DELETE', "reports/$reportId");
    }

    /**
     * // TODO : sûrement non fonctionnel.
     *
     * @param array<string,UploadedFile> $files
     */
    public function addAttachments(string $reportId, array $files): array
    {
        return $this->request('POST', "reports/$reportId/attachments", [], [], $files);
    }

    public function deleteAttachment(string $reportId, string $attachmentId): array
    {
        return $this->request('DELETE', "reports/$reportId/attachments/$attachmentId");
    }

    public function getRss(): string
    {
        return $this->request('GET', 'reports/rss', [], [], [], false, false, false);
    }

    /**
     * @param array<mixed> $query
     */
    public function getWfs(array $query = []): string
    {
        return $this->request('GET', 'reports/wfs', [], $query, [], false, false, false);
    }
}
