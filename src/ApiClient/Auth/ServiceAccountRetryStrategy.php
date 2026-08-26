<?php

namespace App\ApiClient\Auth;

use Symfony\Component\HttpClient\Response\AsyncContext;
use Symfony\Component\HttpClient\Retry\RetryStrategyInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

/**
 * Rejoue une fois un appel refusé en 401 après avoir jeté le token du compte de service (expiré ou révoqué).
 *
 * @SuppressWarnings(UnusedFormalParameter) signature imposée par l'interface
 */
final class ServiceAccountRetryStrategy implements RetryStrategyInterface
{
    public function __construct(
        private ServiceAccountHttpClient $client,
    ) {
    }

    public function shouldRetry(AsyncContext $context, ?string $responseContent, ?TransportExceptionInterface $exception): bool
    {
        if (401 !== $context->getStatusCode()) {
            return false;
        }

        $this->client->invalidateToken();

        return true;
    }

    public function getDelay(AsyncContext $context, ?string $responseContent, ?TransportExceptionInterface $exception): int
    {
        return 0;
    }
}
