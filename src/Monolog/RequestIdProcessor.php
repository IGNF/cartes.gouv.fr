<?php

namespace App\Monolog;

use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Ajoute le request_id à chaque enregistrement pour corréler tous les logs d'une même requête.
 */
class RequestIdProcessor implements ProcessorInterface
{
    public function __construct(
        private RequestStack $requestStack,
        private RequestIdResolver $requestIdResolver,
    ) {
    }

    public function __invoke(LogRecord $record): LogRecord
    {
        // Requête principale : les sous-requêtes (rendu d'erreur, fragments) partagent son id
        $request = $this->requestStack->getMainRequest();
        if (null !== $request) {
            $record->extra['request_id'] = $this->requestIdResolver->resolve($request);
        }

        return $record;
    }
}
