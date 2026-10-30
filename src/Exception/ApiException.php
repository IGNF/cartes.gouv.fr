<?php

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ApiException extends HttpException
{
    /**
     * @param array<mixed>|string $details
     */
    public function __construct(string $message, int $statusCode = Response::HTTP_BAD_REQUEST, private readonly array|string $details = [], ?\Throwable $previous = null)
    {
        parent::__construct($statusCode, $message, $previous, [], $statusCode);
    }

    public function __toString(): string
    {
        return self::class.": [{$this->code}]: {$this->message}\n";
    }

    /**
     * @return array<mixed>
     */
    public function getDetails(): array
    {
        return $this->details;
    }
}
