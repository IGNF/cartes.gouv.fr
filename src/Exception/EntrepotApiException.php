<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\HttpException;

class EntrepotApiException extends HttpException
{
    /** @var array<mixed> */
    private array $details;

    /**
     * @param array<mixed> $details
     */
    public function __construct(string $message, int $statusCode = -1, array $details = [], \Throwable $previous = null)
    {
        $this->details = $details;
        $this->code = $statusCode;
        parent::__construct($statusCode, $message, $previous);
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
