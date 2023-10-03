<?php

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AppException extends HttpException
{
    /** @var array<mixed> */
    private array $details;

    /**
     * @param array<mixed> $details
     */
    public function __construct(string $message, int $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR, array $details = [], \Throwable $previous = null)
    {
        $this->details = $details;
        parent::__construct($statusCode, $message, $previous, [], $statusCode);
    }

    public function __toString()
    {
        return __CLASS__.": [{$this->code}]: {$this->message}\n";
    }

    /**
     * @return array<mixed>
     */
    public function getDetails(): array
    {
        return $this->details;
    }
}
