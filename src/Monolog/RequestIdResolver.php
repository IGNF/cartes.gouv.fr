<?php

namespace App\Monolog;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Uid\Uuid;

/**
 * Fournit l'identifiant de corrélation d'une requête : X-Request-Id posé par l'ingress, sinon généré.
 */
class RequestIdResolver
{
    private const REQUEST_ATTRIBUTE = '_request_id';

    public function resolve(Request $request): string
    {
        $requestId = $request->attributes->get(self::REQUEST_ATTRIBUTE);
        if (!\is_string($requestId)) {
            // Header contrôlé par le client : format strict, sinon id généré (évite de forger des tokens logfmt)
            $header = (string) $request->headers->get('X-Request-Id');
            $requestId = preg_match('/^[A-Za-z0-9._-]{1,64}$/', $header) ? $header : (string) Uuid::v7();
            $request->attributes->set(self::REQUEST_ATTRIBUTE, $requestId);
        }

        return $requestId;
    }
}
