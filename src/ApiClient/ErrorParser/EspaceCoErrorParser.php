<?php

namespace App\ApiClient\ErrorParser;

use App\Exception\ApiException;
use Symfony\Contracts\HttpClient\ResponseInterface;

class EspaceCoErrorParser implements ErrorParserInterface
{
    public function extractErrorResponse(ResponseInterface $response): mixed
    {
        return $response->toArray(false);
    }

    public function extractErrorMessage(mixed $errorResponse, ResponseInterface $response): string
    {
        if (is_array($errorResponse) && array_key_exists('message', $errorResponse) && is_string($errorResponse['message'])) {
            return $errorResponse['message'];
        }

        return 'EspaceCo API Error';
    }

    public function createApiException(string $message, int $statusCode, mixed $details = []): ApiException
    {
        return new ApiException($message, $statusCode, is_string($details) ? ['message' => $details] : $details);
    }
}
