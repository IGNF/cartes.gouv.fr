<?php

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Cette classe d'exception devrait être utilisée **uniquement** dans les ApiController de cartes.gouv.fr pour remonter les erreurs au frontend react. Il suffit de lever cette exception et l'event subscriber `App\Listener\CartesApiExceptionSubscriber` se chargera de renvoyer les erreurs dans un json de façon homogène.
 */
class CartesApiException extends HttpException
{
    /** @var array<mixed> */
    private array $details;

    /**
     * @param array<mixed> $details
     */
    public function __construct(string $message, int $statusCode = Response::HTTP_BAD_REQUEST, array $details = [], \Throwable $previous = null)
    {
        $this->details = $details;
        parent::__construct($statusCode, $message, $previous, [], $statusCode);
    }

    public function getDetails(): array
    {
        return $this->details;
    }
}
