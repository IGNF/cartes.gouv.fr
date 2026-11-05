<?php

namespace App\Security;

use App\Security\Authenticator\KeycloakAuthenticator;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Stevenmaguire\OAuth2\Client\Provider\Keycloak;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Event\LogoutEvent;

class LogoutSubscriber
{
    public function __construct(
        private readonly ClientRegistry $clientRegistry,
        private readonly UrlGeneratorInterface $urlGenerator,
        private readonly ParameterBagInterface $parameters,
        private readonly KeycloakTokenManager $tokenManager,
    ) {
    }

    #[AsEventListener(event: LogoutEvent::class)]
    public function onLogout(LogoutEvent $event): void
    {
        $idToken = $this->tokenManager->getIdToken();
        $this->tokenManager->clearAccessToken();

        $redirectUrl = $this->urlGenerator->generate(KeycloakAuthenticator::HOME_ROUTE, [], UrlGeneratorInterface::ABSOLUTE_URL).KeycloakAuthenticator::AFTER_LOGOUT_PATH;

        if ('test' === $this->parameters->get('app_env') || null === $idToken) {
            $response = new RedirectResponse($redirectUrl);
        } else {
            /** @var Keycloak $keycloak */
            $keycloak = $this->clientRegistry->getClient('keycloak')->getOAuth2Provider();

            $response = new RedirectResponse($keycloak->getLogoutUrl([
                'post_logout_redirect_uri' => $redirectUrl,
                'id_token_hint' => $idToken,
            ]));
        }

        $event->setResponse($response);
    }
}
