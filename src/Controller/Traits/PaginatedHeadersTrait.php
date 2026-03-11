<?php

namespace App\Controller\Traits;

use Symfony\Component\HttpFoundation\JsonResponse;

trait PaginatedHeadersTrait
{
    /**
     * @param array<string, mixed> $headers
     */
    private function setPaginatedHeaders(JsonResponse $response, array $headers): void
    {
        $this->setHeaderFromApiResponse($response, 'content-range', $headers);
        $this->setHeaderFromApiResponse($response, 'link', $headers);
    }

    /**
     * @param array<string, mixed> $headers
     */
    private function setHeaderFromApiResponse(JsonResponse $response, string $headerName, array $headers): void
    {
        if (!array_key_exists($headerName, $headers)) {
            return;
        }

        $headerValue = $headers[$headerName];
        if (is_array($headerValue)) {
            $headerValue = $headerValue[0] ?? null;
        }

        if (is_string($headerValue) && '' !== $headerValue) {
            $response->headers->set($headerName, $headerValue);
        }
    }
}
