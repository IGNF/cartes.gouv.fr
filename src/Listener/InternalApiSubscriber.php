<?php

namespace App\Listener;

use App\Controller\ApiControllerInterface;
use App\Exception\CartesApiException;
use App\Security\KeycloakToken;
use App\Security\User;
use League\OAuth2\Client\Token\AccessToken;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * @see https://symfony.com/doc/current/event_dispatcher.html#before-filters-with-the-kernel-controller-event
 */
class InternalApiSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private ParameterBagInterface $parameters,
        private Security $security,
    ) {
    }

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

        // quand une classe controller définit plusieurs méthodes, ça retourne un array, par exemple -> [$controllerInstance, 'methodName']
        // seule la classe controller nous intéresse
        if (is_array($controller)) {
            $controller = $controller[0];
        }

        // vérification de token uniquement si la requête concerne un controller implémentant ApiControllerInterface et que APP_ENV != test
        if ($controller instanceof ApiControllerInterface) {
            if ('test' !== $this->parameters->get('app_env')) {
                /** @var SessionInterface */
                $session = $event->getRequest()->getSession();

                /** @var AccessToken */
                $accessToken = $session->get(KeycloakToken::SESSION_KEY);

                $user = $this->security->getUser();

                if (null === $user
                    || !($user instanceof User)
                    || null == $accessToken
                    || (null != $accessToken && $accessToken->hasExpired())) {
                    throw new CartesApiException('Unauthorized', Response::HTTP_UNAUTHORIZED, ['controller' => ApiControllerInterface::class, 'session_expired' => true]);
                }
            }
        }
    }
}
