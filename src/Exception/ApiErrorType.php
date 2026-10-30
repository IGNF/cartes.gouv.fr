<?php

namespace App\Exception;

/**
 * Valeurs du membre `type` des erreurs d'API, sur lesquelles le front branche.
 */
final class ApiErrorType
{
    public const SESSION_EXPIRED = '/errors/session-expired';
    public const ANONYMOUS = '/errors/anonymous';
}
