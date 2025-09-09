<?php

namespace App\Services\EspaceCoApi;

class ReplyApiService extends BaseEspaceCoApiService
{
    /**
     * @param array<mixed> $body
     */
    public function add(string $reportId, array $body): array
    {
        return $this->request('POST', "reports/$reportId/replies", $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function replace(string $reportId, string $replyId, array $body): array
    {
        return $this->request('PUT', "reports/$reportId/replies/$replyId", $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function modify(string $reportId, string $replyId, array $body): array
    {
        return $this->request('PATCh', "reports/$reportId/replies/$replyId", $body);
    }
}
