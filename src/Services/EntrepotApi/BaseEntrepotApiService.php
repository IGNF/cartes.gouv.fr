<?php

namespace App\Services\EntrepotApi;

use App\Exception\ApiException;
use App\Security\KeycloakTokenManager;
use App\Services\AbstractApiService;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpClient\Exception\JsonException;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class BaseEntrepotApiService extends AbstractApiService
{
    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        KeycloakTokenManager $tokenManager,
        LoggerInterface $logger,
        protected CacheInterface $cache,
    ) {
        parent::__construct($httpClient, $parameters, $filesystem, $tokenManager, $logger, 'api_entrepot_url');
    }

    protected function extractErrorResponse(ResponseInterface $response): mixed
    {
        try {
            return $response->toArray(false);
        } catch (JsonException $exception) {
            return $response->getContent(false);
        }
    }

    protected function extractErrorMessage(mixed $errorResponse, ResponseInterface $response): string
    {
        $errorMsg = 'Entrepot API Error';
        if (is_array($errorResponse) && array_key_exists('error_description', $errorResponse)) {
            return is_array($errorResponse['error_description']) ? implode(', ', $errorResponse['error_description']) : $errorResponse['error_description'];
        }

        if (is_array($errorResponse) && array_key_exists('message', $errorResponse) && is_string($errorResponse['message'])) {
            return $errorResponse['message'];
        }

        if (is_string($errorResponse) && '' !== trim($errorResponse)) {
            return $errorResponse;
        }

        return $errorMsg;
    }

    protected function createApiException(string $message, int $statusCode, mixed $details = []): ApiException
    {
        return new ApiException($message, $statusCode, is_string($details) ? ['message' => $details] : $details);
    }
}
