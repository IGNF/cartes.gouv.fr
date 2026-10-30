<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Exception applicative unique : rendue en Problem Details (RFC 9457) par `App\Serializer\ApiErrorNormalizer`.
 */
class AppException extends HttpException
{
    /**
     * @param array<mixed>          $details membre d'extension `details` du corps d'erreur
     * @param string|null           $type    référence relative `/errors/<slug>`, seulement quand le front branche dessus
     * @param array<string, string> $headers
     */
    public function __construct(
        string $message,
        int $statusCode,
        private readonly array $details = [],
        ?\Throwable $previous = null,
        private readonly ?string $type = null,
        array $headers = [],
    ) {
        parent::__construct($statusCode, $message, $previous, $headers, $statusCode);
    }

    public function __toString(): string
    {
        return static::class.": [{$this->code}]: {$this->message}\n";
    }

    /**
     * @return array<mixed>
     */
    public function getDetails(): array
    {
        return $this->details;
    }

    public function getType(): ?string
    {
        return $this->type;
    }
}
