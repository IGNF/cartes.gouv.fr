<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class StyleApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco_style')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $query
     */
    public function getImage(string $name, array $query): mixed
    {
        $pending = $this->api->get("image/$name", $query);
        $content = $pending->text();
        $response = $pending->getResponse();

        $headerKeys = ['date', 'vary', 'content-disposition', 'cache-control', 'expires', 'content-type'];
        $headers = array_filter($response->getHeaders(), fn ($k) => in_array($k, $headerKeys), ARRAY_FILTER_USE_KEY);

        return [
            'content' => $content,
            'headers' => $headers,
            'code' => $response->getStatusCode(),
        ];
    }
}
