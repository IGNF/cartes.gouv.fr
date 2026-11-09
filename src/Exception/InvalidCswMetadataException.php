<?php

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;

/**
 * Fichier de métadonnée ISO 19139 illisible (XML mal formé, élément obligatoire absent) : donnée amont cassée, rendue en 502.
 */
class InvalidCswMetadataException extends ApiException
{
    public function __construct(string $message, ?\Throwable $previous = null)
    {
        parent::__construct("Métadonnée invalide : $message", Response::HTTP_BAD_GATEWAY, [], $previous);
    }
}
