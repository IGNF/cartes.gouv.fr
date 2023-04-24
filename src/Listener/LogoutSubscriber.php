<?php

namespace App\Listener;

use App\Security\KeycloakToken;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Stevenmaguire\OAuth2\Client\Provider\Keycloak;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Event\LogoutEvent;

class LogoutSubscriber implements EventSubscriberInterface
{
    private ClientRegistry $clientRegistry;
    private UrlGeneratorInterface $urlGenerator;

    public function __construct(ClientRegistry $clientRegistry, UrlGeneratorInterface $urlGenerator)
    {
        $this->clientRegistry = $clientRegistry;
        $this->urlGenerator = $urlGenerator;
    }

    public static function getSubscribedEvents(): array
    {
        return [LogoutEvent::class => 'onLogout'];
    }

    public function onLogout(LogoutEvent $event): void
    {
        $session = $event->getRequest()->getSession();
        $session->remove(KeycloakToken::SESSION_KEY);

        /** @var Keycloak */
        $keycloak = $this->clientRegistry->getClient('keycloak')->getOAuth2Provider();

        $homeUrl = $this->urlGenerator->generate('cartesgouvfr_app', [], UrlGeneratorInterface::ABSOLUTE_URL);
        $response = new RedirectResponse($keycloak->getLogoutUrl([
            'redirect_uri' => $homeUrl,
        ]));
        $event->setResponse($response);
    }
}
