<?php

namespace App\Listener;

use App\Security\KeycloakToken;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Stevenmaguire\OAuth2\Client\Provider\Keycloak;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Event\LogoutEvent;

class LogoutSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private ClientRegistry $clientRegistry,
        private UrlGeneratorInterface $urlGenerator,
        private ParameterBagInterface $parameters
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [LogoutEvent::class => 'onLogout'];
    }

    public function onLogout(LogoutEvent $event): void
    {
        $session = $event->getRequest()->getSession();
        $session->remove(KeycloakToken::SESSION_KEY);

        $homeUrl = $this->urlGenerator->generate('cartesgouvfr_app', [], UrlGeneratorInterface::ABSOLUTE_URL);

        // comportement si mode test
        if ('test' === $this->parameters->get('app_env')) {
            $response = new RedirectResponse($homeUrl);
        } else {
            /** @var Keycloak */
            $keycloak = $this->clientRegistry->getClient('keycloak')->getOAuth2Provider();

            $response = new RedirectResponse($keycloak->getLogoutUrl([
                'post_logout_redirect_uri' => $homeUrl,
            ]));
        }

        $event->setResponse($response);
    }
}
