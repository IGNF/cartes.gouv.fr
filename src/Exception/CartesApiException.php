<?php

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Exception destinée au frontend react : levée dans les ApiController de cartes.gouv.fr (ou par une exception métier qui l'étend), l'event subscriber `App\Listener\CartesApiExceptionSubscriber` la renvoie dans un json homogène.
 */
class CartesApiException extends HttpException
{
    /**
     * @param array<mixed> $details
     */
    public function __construct(string $message, int $statusCode = Response::HTTP_BAD_REQUEST, private readonly array $details = [], ?\Throwable $previous = null)
    {
        parent::__construct($statusCode, $message, $previous, [], $statusCode);
    }

    /**
     * @return array<mixed>
     */
    public function getDetails(): array
    {
        return $this->details;
    }
}
