<?php

namespace App\Services\FileUploader\Exception;

use Symfony\Component\HttpFoundation\Response;

final class FileUploaderException extends \RuntimeException
{
    public function __construct(string $message, private readonly int $statusCode = Response::HTTP_BAD_REQUEST, ?\Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
