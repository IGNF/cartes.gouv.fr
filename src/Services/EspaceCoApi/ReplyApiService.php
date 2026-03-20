<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class ReplyApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $body
     */
    public function add(string $reportId, array $body): ResponsePromise
    {
        return $this->api->post("reports/$reportId/replies", $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function replace(string $reportId, string $replyId, array $body): ResponsePromise
    {
        return $this->api->put("reports/$reportId/replies/$replyId", $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function modify(string $reportId, string $replyId, array $body): ResponsePromise
    {
        return $this->api->patch("reports/$reportId/replies/$replyId", $body);
    }
}
