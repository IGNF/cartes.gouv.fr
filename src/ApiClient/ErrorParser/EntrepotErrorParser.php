<?php

namespace App\ApiClient\ErrorParser;

use App\Exception\ApiException;
use Symfony\Component\HttpClient\Exception\JsonException;
use Symfony\Contracts\HttpClient\ResponseInterface;

class EntrepotErrorParser implements ErrorParserInterface
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
        if (is_array($errorResponse) && array_key_exists('error_description', $errorResponse)) {
            return is_array($errorResponse['error_description'])
                ? implode(', ', $errorResponse['error_description'])
                : $errorResponse['error_description'];
        }

        if (is_array($errorResponse) && array_key_exists('message', $errorResponse) && is_string($errorResponse['message'])) {
            return $errorResponse['message'];
        }

        if (is_string($errorResponse) && '' !== trim($errorResponse)) {
            return $errorResponse;
        }

        return 'Entrepot API Error';
    }

    public function createApiException(string $message, int $statusCode, mixed $details = []): ApiException
    {
        return new ApiException($message, $statusCode, is_string($details) ? ['message' => $details] : $details);
    }
}
