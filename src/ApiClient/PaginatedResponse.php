<?php

namespace App\ApiClient;

final readonly class PaginatedResponse
{
    /**
     * @param array<mixed>        $content
     * @param array<string,mixed> $headers
     */
    public function __construct(
        public array $content,
        public array $headers = [],
    ) {
    }

    public function getContentRange(): ?string
    {
        return $this->headers['content-range'][0] ?? null;
    }

    public function getPageCount(int $limit): ?int
    {
        $contentRange = $this->getContentRange();
        if (null === $contentRange) {
            return null;
        }

        $total = (int) explode('/', $contentRange)[1];

        return (int) ceil($total / $limit);
    }
}
