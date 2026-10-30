<?php

namespace App\Listener;

use Psr\Log\LogLevel;
use Symfony\Component\HttpKernel\EventListener\ErrorListener;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

/**
 * Journalise les erreurs HTTP 4xx en notice et les 5xx en erreur (remplace la classe du service `exception_listener`, voir Kernel).
 */
class StatusAwareErrorListener extends ErrorListener
{
    protected function logException(\Throwable $exception, string $message, ?string $logLevel = null, ?string $logChannel = null): void
    {
        if ($exception instanceof HttpExceptionInterface) {
            $logLevel = $exception->getStatusCode() >= 500 ? LogLevel::ERROR : LogLevel::NOTICE;
        }

        parent::logException($exception, $message, $logLevel, $logChannel);
    }
}
