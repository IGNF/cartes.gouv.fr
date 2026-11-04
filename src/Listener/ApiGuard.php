<?php

namespace App\Listener;

use App\Exception\AppException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Garde CSRF des routes d'API : exige l'en-tête `X-Requested-With` envoyé par `jsonFetch`, qu'aucune navigation, sous-ressource ni requête d'un autre site ne porte.
 */
final readonly class ApiGuard
{
    public function __construct(
        #[Autowire(service: 'app.api_path_matcher')]
        private RequestMatcherInterface $apiPathMatcher,
        #[Autowire(service: 'app.api_doc_path_matcher')]
        private RequestMatcherInterface $apiDocPathMatcher,
    ) {
    }

    // avant le pare-feu (priorité 8) : une requête refusée n'est jamais authentifiée
    #[AsEventListener(event: KernelEvents::REQUEST, priority: 16)]
    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        if (!$this->apiPathMatcher->matches($request) || $this->apiDocPathMatcher->matches($request)) {
            return;
        }

        if (!$request->isXmlHttpRequest()) {
            throw new AppException('Appel d’API refusé : en-tête X-Requested-With absent', Response::HTTP_FORBIDDEN);
        }
    }
}
