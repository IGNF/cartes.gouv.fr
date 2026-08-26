<?php

namespace App\ApiClient\Auth;

use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\HttpClient\ResponseStreamInterface;

/**
 * Authentifie les appels avec le token client_credentials d'un compte de service Keycloak.
 * Le token est partagé par pod dans le cache applicatif, expiré un peu avant sa fin de vie annoncée.
 *
 * Client privilégié : l'Entrepôt autorise le compte de service, pas l'utilisateur. Seul SandboxService l'utilise,
 * après avoir vérifié lui-même l'appartenance de l'utilisateur. Tout nouvel usage doit faire cette vérification.
 */
final class ServiceAccountHttpClient implements HttpClientInterface
{
    private const EXPIRY_MARGIN = 60;
    private const DEFAULT_EXPIRES_IN = 300;

    public function __construct(
        private HttpClientInterface $inner,
        private HttpClientInterface $tokenClient,
        private CacheInterface $cache,
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

    /** Après un 401 : le prochain appel redemande un token. */
    public function invalidateToken(): void
    {
        $this->cache->delete($this->cacheKey());
    }

    /**
     * @throws ServiceAccountAuthenticationException
     */
    private function getAccessToken(): string
    {
        return $this->cache->get($this->cacheKey(), function (ItemInterface $item): string {
            try {
                $response = $this->tokenClient->request('POST', 'token', [
                    'body' => [
                        'grant_type' => 'client_credentials',
                        'client_id' => $this->clientId,
                        'client_secret' => $this->clientSecret,
                    ],
                    'headers' => ['Accept' => 'application/json'],
                ])->toArray();
            } catch (ExceptionInterface $e) {
                throw new ServiceAccountAuthenticationException('Compte de service : échec de l\'authentification', 0, $e);
            }

            $accessToken = $response['access_token'] ?? null;
            if (!is_string($accessToken) || '' === $accessToken) {
                throw new ServiceAccountAuthenticationException('Compte de service : token absent de la réponse');
            }

            $expiresIn = is_numeric($response['expires_in'] ?? null) ? (int) $response['expires_in'] : self::DEFAULT_EXPIRES_IN;
            // toujours strictement sous la durée annoncée : jamais de token périmé servi depuis le cache
            $item->expiresAfter(max(1, $expiresIn - self::EXPIRY_MARGIN));

            return $accessToken;
        });
    }

    private function cacheKey(): string
    {
        return "service-account-token-{$this->clientId}";
    }
}
