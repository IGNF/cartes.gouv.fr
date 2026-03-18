<?php

namespace App\ApiClient;

final readonly class RequestOptions
{
    /**
     * @param iterable<mixed>     $body
     * @param array<string,mixed> $query
     * @param array<string,mixed> $headers
     */
    public function __construct(
        public iterable $body = [],
        public array $query = [],
        public array $headers = [],
        public bool $fileUpload = false,
    ) {
    }

    /**
     * @param array<string,mixed> $query
     */
    public static function query(array $query): self
    {
        return new self(query: $query);
    }

    /**
     * @param iterable<mixed>     $body
     * @param array<string,mixed> $query
     */
    public static function json(iterable $body, array $query = []): self
    {
        return new self(body: $body, query: $query);
    }

    /**
     * @param iterable<mixed>     $body
     * @param array<string,mixed> $headers
     * @param array<string,mixed> $query
     */
    public static function forFileUpload(iterable $body, array $headers, array $query = []): self
    {
        return new self(body: $body, query: $query, headers: $headers, fileUpload: true);
    }
}
