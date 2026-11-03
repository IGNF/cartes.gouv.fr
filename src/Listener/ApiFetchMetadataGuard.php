<?php

namespace App\Listener;

use App\Exception\AppException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Garde des routes d'API contre les requêtes d'un autre site et les navigations (CSRF, ouverture dans un onglet).
 *
 * Fetch Metadata (`Sec-Fetch-*`) fait foi ; sans ces en-têtes, l'en-tête `X-Requested-With` des appels `jsonFetch` est exigé.
 */
final readonly class ApiFetchMetadataGuard
{
    private const REJECTED_SITES = ['cross-site', 'same-site'];

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

        if (!$this->isAllowed($request)) {
            throw new AppException('Appel d’API refusé : origine ou navigation non autorisée', Response::HTTP_FORBIDDEN);
        }
    }

    private function isAllowed(Request $request): bool
    {
        $site = $request->headers->get('Sec-Fetch-Site');
        if (null === $site) {
            return $request->isXmlHttpRequest();
        }

        return !in_array($site, self::REJECTED_SITES, true) && 'navigate' !== $request->headers->get('Sec-Fetch-Mode');
    }
}
