<?php

namespace App\ApiClient;

use App\ApiClient\ErrorParser\EntrepotErrorParser;
use App\ApiClient\ErrorParser\EspaceCoErrorParser;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class ApiClientFactory
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private ParameterBagInterface $parameters,
        private RequestStack $requestStack,
        private LoggerInterface $logger,
    ) {
    }

    public function createEntrepotClient(): ApiClient
    {
        $authenticated = $this->buildAuthenticatedClient('api_entrepot_url');

        return new ApiClient($authenticated, new EntrepotErrorParser(), $this->logger);
    }

    public function createEspaceCoClient(): ApiClient
    {
        $authenticated = $this->buildAuthenticatedClient('api_espaceco_url');

        return new ApiClient($authenticated, new EspaceCoErrorParser(), $this->logger);
    }

    /**
     * Cas particulier pour l'API Style d'EspaceCo.
     */
    public function createEspaceCoStyleClient(): ApiClient
    {
        $baseUrl = str_replace('/api', '/style', (string) $this->parameters->get('api_espaceco_url'));
        $scoped = $this->httpClient->withOptions([
            'base_uri' => $baseUrl.'/',
            'proxy' => $this->parameters->get('http_proxy'),
            'no_proxy' => $this->parameters->get('no_proxy'),
            // 'verify_peer' => false,
            // 'verify_host' => false,
        ]);

        $authenticated = new AuthenticatedHttpClient($scoped, $this->requestStack);

        return new ApiClient($authenticated, new EspaceCoErrorParser(), $this->logger);
    }

    private function buildAuthenticatedClient(string $urlParameter): AuthenticatedHttpClient
    {
        $scoped = $this->httpClient->withOptions([
            'base_uri' => (string) $this->parameters->get($urlParameter).'/',
            'proxy' => $this->parameters->get('http_proxy'),
            'no_proxy' => $this->parameters->get('no_proxy'),
        ]);

        return new AuthenticatedHttpClient($scoped, $this->requestStack);
    }
}
