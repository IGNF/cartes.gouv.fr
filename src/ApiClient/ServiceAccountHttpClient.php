<?php

namespace App\ApiClient;

use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\HttpClient\ResponseStreamInterface;

/**
 * Authentifie les appels avec le token client_credentials d'un compte de service Keycloak, obtenu au premier appel.
 */
final class ServiceAccountHttpClient implements HttpClientInterface
{
    private ?string $accessToken = null;

    public function __construct(
        private HttpClientInterface $inner,
        private HttpClientInterface $tokenClient,
        private string $clientId,
        #[\SensitiveParameter] private string $clientSecret,
    ) {
    }

    /**
     * @param array<string,mixed> $options
     */
    public function request(string $method, string $url, array $options = []): ResponseInterface
    {
        $options['headers'] ??= [];
        $options['headers']['Authorization'] = "Bearer {$this->getAccessToken()}";

        return $this->inner->request($method, $url, $options);
    }

    public function stream(iterable|ResponseInterface $responses, ?float $timeout = null): ResponseStreamInterface
    {
        return $this->inner->stream($responses, $timeout);
    }

    /**
     * @param array<string,mixed> $options
     */
    public function withOptions(array $options): static
    {
        $clone = clone $this;
        $clone->inner = $this->inner->withOptions($options);

        return $clone;
    }

    /**
     * @throws AccessDeniedException si le compte de service ne peut pas s'authentifier
     */
    private function getAccessToken(): string
    {
        if (null !== $this->accessToken) {
            return $this->accessToken;
        }

        try {
            $response = $this->tokenClient->request('POST', 'token', [
                'body' => [
                    'grant_type' => 'client_credentials',
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                ],
                'headers' => ['Accept' => 'application/json'],
            ]);
            $accessToken = $response->toArray()['access_token'] ?? null;
        } catch (ExceptionInterface $e) {
            throw new AccessDeniedException('Compte de service : échec de l\'authentification', $e);
        }

        if (!is_string($accessToken) || '' === $accessToken) {
            throw new AccessDeniedException('Compte de service : token absent de la réponse');
        }

        return $this->accessToken = $accessToken;
    }
}
