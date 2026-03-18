<?php

namespace App\ApiClient\ErrorParser;

use App\Exception\ApiException;
use Symfony\Contracts\HttpClient\ResponseInterface;

interface ErrorParserInterface
{
    public function extractErrorResponse(ResponseInterface $response): mixed;

    public function extractErrorMessage(mixed $errorResponse, ResponseInterface $response): string;

    public function createApiException(string $message, int $statusCode, mixed $details = []): ApiException;
}
