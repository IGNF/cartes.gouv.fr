<?php

namespace App\ApiClient;

use App\Security\KeycloakTokenManager;
use League\OAuth2\Client\Token\AccessToken;
use Symfony\Component\Security\Core\Exception\AuthenticationExpiredException;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\HttpClient\ResponseStreamInterface;

final class AuthenticatedHttpClient implements HttpClientInterface
{
    public function __construct(
        private HttpClientInterface $inner,
        private KeycloakTokenManager $tokenManager,
    ) {
    }

    /**
     * @param array<string,mixed> $options
     */
    public function request(string $method, string $url, array $options = []): ResponseInterface
    {
        $token = $this->getKeycloakToken();
        $options['headers'] ??= [];
        $options['headers']['Authorization'] = "Bearer {$token->getToken()}";

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

    private function getKeycloakToken(): AccessToken
    {
        return $this->tokenManager->getToken() ?? throw new AuthenticationExpiredException();
    }
}
