<?php

namespace App\ApiClient;

use App\ApiClient\ErrorParser\EntrepotErrorParser;
use App\ApiClient\ErrorParser\EspaceCoErrorParser;
use App\Security\KeycloakTokenManager;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class ApiClientFactory
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private ParameterBagInterface $parameters,
        private KeycloakTokenManager $tokenManager,
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

        $authenticated = new AuthenticatedHttpClient($scoped, $this->tokenManager);

        return new ApiClient($authenticated, new EspaceCoErrorParser(), $this->logger);
    }

    /**
     * Client Entrepôt authentifié par le compte de service du bac à sable (token client_credentials, obtenu au premier appel).
     */
    public function createSandboxServiceAccountClient(): ApiClient
    {
        $tokenClient = $this->scopedClient(sprintf(
            '%s/realms/%s/protocol/openid-connect',
            (string) $this->parameters->get('iam_url'),
            (string) $this->parameters->get('iam_realm'),
        ));
        $credentials = $this->parameters->get('sandbox_service_account');

        $authenticated = new ServiceAccountHttpClient(
            $this->scopedClient((string) $this->parameters->get('api_entrepot_url')),
            $tokenClient,
            (string) ($credentials['client_id'] ?? ''),
            (string) ($credentials['client_secret'] ?? ''),
        );

        return new ApiClient($authenticated, new EntrepotErrorParser(), $this->logger);
    }

    private function buildAuthenticatedClient(string $urlParameter): AuthenticatedHttpClient
    {
        return new AuthenticatedHttpClient($this->scopedClient((string) $this->parameters->get($urlParameter)), $this->tokenManager);
    }

    private function scopedClient(string $baseUrl): HttpClientInterface
    {
        return $this->httpClient->withOptions([
            'base_uri' => $baseUrl.'/',
            'proxy' => $this->parameters->get('http_proxy'),
            'no_proxy' => $this->parameters->get('no_proxy'),
        ]);
    }
}
