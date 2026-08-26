<?php

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;

/**
 * La communauté du bac à sable configurée est introuvable ou l'Entrepôt ne répond pas : l'application est dégradée.
 */
final class SandboxUnavailableException extends CartesApiException
{
    public function __construct(string $reason, ?\Throwable $previous = null)
    {
        parent::__construct('Bac à sable indisponible', Response::HTTP_SERVICE_UNAVAILABLE, ['reason' => $reason], $previous);
    }
}
