<?php

declare(strict_types=1);

namespace App\ApiClient\ErrorParser;

use App\Exception\ApiException;
use Symfony\Component\HttpClient\Exception\JsonException;
use Symfony\Contracts\HttpClient\ResponseInterface;

// erreurs de l’API GéoCaptcha : { "msg": "..." }, parfois avec "result": false
final class GeocaptchaErrorParser implements ErrorParserInterface
{
    public function extractErrorResponse(ResponseInterface $response): mixed
    {
        try {
            return $response->toArray(false);
        } catch (JsonException) {
            return $response->getContent(false);
        }
    }

    public function extractErrorMessage(mixed $errorResponse, ResponseInterface $response): string
    {
        if (is_array($errorResponse) && is_string($errorResponse['msg'] ?? null)) {
            return $errorResponse['msg'];
        }

        return 'GeoCaptcha API Error';
    }

    public function createApiException(string $message, int $statusCode, mixed $details = []): ApiException
    {
        return new ApiException($message, $statusCode, is_array($details) ? $details : []);
    }
}
