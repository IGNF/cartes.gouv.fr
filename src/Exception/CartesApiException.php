<?php

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Exception destinée au frontend react : levée dans les ApiController de cartes.gouv.fr (ou par une exception métier qui l'étend), l'event subscriber `App\Listener\CartesApiExceptionSubscriber` la renvoie dans un json homogène.
 */
class CartesApiException extends HttpException
{
    /** @var array<mixed> */
    private array $details;

    /**
     * @param array<mixed> $details
     */
    public function __construct(string $message, int $statusCode = Response::HTTP_BAD_REQUEST, array $details = [], ?\Throwable $previous = null)
    {
        $this->details = $details;
        parent::__construct($statusCode, $message, $previous, [], $statusCode);
    }

    public function getDetails(): array
    {
        return $this->details;
    }
}
