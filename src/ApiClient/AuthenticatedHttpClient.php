<?php

namespace App\ApiClient;

use App\Security\KeycloakToken;
use League\OAuth2\Client\Token\AccessToken;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Exception\AuthenticationExpiredException;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\HttpClient\ResponseStreamInterface;

final class AuthenticatedHttpClient implements HttpClientInterface
{
    public function __construct(
        private HttpClientInterface $inner,
        private RequestStack $requestStack,
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
        $session = $this->requestStack->getSession();

        /** @var ?AccessToken */
        $accessToken = $session->get(KeycloakToken::SESSION_KEY);

        if (null === $accessToken) {
            throw new AuthenticationExpiredException();
        }

        return $accessToken;
    }
}
