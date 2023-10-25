<?php

namespace App\Listener;

use App\Controller\Api\ApiControllerInterface;
use App\Exception\CartesApiException;
use App\Security\KeycloakToken;
use League\OAuth2\Client\Token\AccessToken;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * @see https://symfony.com/doc/current/event_dispatcher.html#event-dispatcher-before-after-filters
 */
class InternalApiSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::CONTROLLER => 'onKernelController',
        ];
    }

    /**
     * Cette fonction est appelée avant chaque action des controllers qui implémente l'interface `InternalApiController`. Ici, on vérifie si la session contient un token de keycloak et s'il est toujours valide.
     */
    public function onKernelController(ControllerEvent $event): void
    {
        $controller = $event->getController();

        // quand une classe controller définit plusieurs méthodes, ça retourne un array du genre -> [$controllerInstance, 'methodName']
        // seule la classe controller nous intéresse
        if (is_array($controller)) {
            $controller = $controller[0];
        }

        if ($controller instanceof ApiControllerInterface) {
            /** @var SessionInterface */
            $session = $event->getRequest()->getSession();

            /** @var AccessToken */
            $accessToken = $session->get(KeycloakToken::SESSION_KEY);

            // TODO préciser que c'est l'API interne
            if (null == $accessToken
                || (null != $accessToken && $accessToken->hasExpired())) {
                throw new CartesApiException(Response::$statusTexts[Response::HTTP_UNAUTHORIZED], Response::HTTP_UNAUTHORIZED, ['controller' => ApiControllerInterface::class]);
            }
        }
    }
}
