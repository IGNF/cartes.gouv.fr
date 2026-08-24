<?php

namespace App\Listener;

use App\Controller\AppController;
use App\Monolog\RequestIdResolver;
use App\Security\User;
use Monolog\Attribute\WithMonologChannel;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\TerminateEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Émet une ligne d'accès logfmt par requête, cherchable telle quelle dans Grafana/Loki.
 *
 * Voir docs/developer/logs.md pour le format et les choix de minimisation (RGPD).
 */
#[WithMonologChannel('access')]
final class AccessLogSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private LoggerInterface $logger,
        private Security $security,
        private RequestIdResolver $requestIdResolver,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            // kernel.terminate : après envoi de la réponse, aucune latence ajoutée
            KernelEvents::TERMINATE => 'onKernelTerminate',
        ];
    }

    public function onKernelTerminate(TerminateEvent $event): void
    {
        $request = $event->getRequest();
        $route = $request->attributes->get('_route');

        // Probes de santé exclues, comme dans l'access log Caddy
        if (AppController::HEALTH_ROUTE === $route) {
            return;
        }
        $user = $this->security->getUser();

        $tokens = [
            'method' => $request->getMethod(),
            // URI brute sans query string : pas de données personnelles ni de caractères ambigus
            'path' => strtok($request->getRequestUri(), '?'),
            'status' => $event->getResponse()->getStatusCode(),
            'duration_ms' => (int) round((microtime(true) - (float) $request->server->get('REQUEST_TIME_FLOAT')) * 1000),
            'route' => \is_string($route) ? $route : null,
            'request_id' => $this->requestIdResolver->resolve($request),
            // UUID technique du compte, jamais l'email ni le username
            'user' => $user instanceof User ? $user->getId() : null,
            // Referer sans query string (même minimisation que path) ; mêmes clés que l'access log Caddy
            'referer' => $this->sanitizeToken(strtok((string) $request->headers->get('Referer'), '?')),
            'user_agent' => $this->sanitizeToken($request->headers->get('User-Agent')),
        ];

        $line = [];
        foreach ($tokens as $key => $value) {
            if (null !== $value) {
                $line[] = sprintf('%s=%s', $key, $value);
            }
        }

        $this->logger->info(implode(' ', $line));
    }

    /**
     * Valeur contrôlée par le client : token plat sans espace ni « = », tronqué (anti-injection logfmt, ligne cherchable).
     */
    private function sanitizeToken(string|false|null $value): ?string
    {
        if (!\is_string($value) || '' === $value) {
            return null;
        }

        return (string) preg_replace('/[^\x21-\x7E]|[="\\\\]/', '_', substr($value, 0, 200));
    }
}
