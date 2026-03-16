<?php

namespace App\Services\EspaceCoApi;

use App\Exception\ApiException;
use App\Security\KeycloakTokenManager;
use App\Services\AbstractApiService;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class BaseEspaceCoApiService extends AbstractApiService
{
    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        KeycloakTokenManager $tokenManager,
        LoggerInterface $logger,
    ) {
        parent::__construct($httpClient, $parameters, $filesystem, $tokenManager, $logger, 'api_espaceco_url');
    }

    protected function extractErrorResponse(ResponseInterface $response): mixed
    {
        return $response->toArray(false);
    }

    protected function extractErrorMessage(mixed $errorResponse, ResponseInterface $response): string
    {
        if (is_array($errorResponse) && array_key_exists('message', $errorResponse) && is_string($errorResponse['message'])) {
            return $errorResponse['message'];
        }

        return 'EspaceCo API Error';
    }

    protected function createApiException(string $message, int $statusCode, mixed $details = []): ApiException
    {
        return new ApiException($message, $statusCode, is_string($details) ? ['message' => $details] : $details);
    }
}
