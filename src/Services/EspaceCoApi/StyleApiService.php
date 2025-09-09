<?php

namespace App\Services\EspaceCoApi;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class StyleApiService extends BaseEspaceCoApiService
{
    protected HttpClientInterface $apiClient;

    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        RequestStack $requestStack,
        LoggerInterface $logger,
    ) {
        parent::__construct($httpClient, $parameters, $filesystem, $requestStack, $logger);

        $this->apiClient = $httpClient->withOptions([
            'base_uri' => str_replace('/api', '/style', $parameters->get('api_espaceco_url')).'/',
            'proxy' => $parameters->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    /**
     * @param array<mixed> $query
     */
    public function getImage(string $name, array $query): mixed
    {
        $options = $this->prepareOptions([], $query);
        $response = $this->apiClient->request('GET', "image/$name", $options);

        $headerKeys = ['date', 'vary', 'content-disposition', 'cache-control', 'expires', 'content-type'];
        $headers = array_filter($response->getHeaders(), fn ($k) => in_array($k, $headerKeys), ARRAY_FILTER_USE_KEY);

        return [
            'content' => $this->handleResponse($response, false),
            'headers' => $headers,
            'code' => $response->getStatusCode(),
        ];
    }
}
