<?php

namespace App\Security\Authenticator;

use App\Security\KeycloakTokenManager;
use App\Security\KeycloakUserProvider;
use App\Security\State\LoginStateSerializer;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Security\Authenticator\OAuth2Authenticator;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

class KeycloakAuthenticator extends OAuth2Authenticator implements AuthenticationEntryPointInterface
{
    public const LOGIN_ROUTE = 'cartesgouvfr_security_login';
    public const LOGIN_CHECK_ROUTE = 'cartesgouvfr_security_login_check';
    // accueil de l’application, repli après connexion ; les chemins suivants s’y ajoutent
    public const HOME_ROUTE = 'cartesgouvfr_app';
    public const AFTER_LOGOUT_PATH = 'publier-une-donnee';
    public const LOGIN_FAILED_PATH = 'publier-une-donnee?login_failed=1';
    public const POPUP_CALLBACK_ROUTE = 'cartesgouvfr_security_login_popup_callback';
    public const STATE_COOKIE_NAME = '__Host-CGSTATE';
    private const REQUEST_ATTR_STATE = '_login_state';

    public function __construct(
        private readonly ClientRegistry $clientRegistry,
        private readonly RouterInterface $router,
        private readonly KeycloakTokenManager $tokenManager,
        private readonly LoginStateSerializer $loginStateSerializer,
        private readonly LoggerInterface $logger,
        private readonly KeycloakUserProvider $userProvider,
    ) {
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        return new RedirectResponse($this->router->generate(self::LOGIN_ROUTE), Response::HTTP_TEMPORARY_REDIRECT);
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function supports(Request $request): ?bool
    {
        return self::LOGIN_CHECK_ROUTE === $request->attributes->get('_route');
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function authenticate(Request $request): Passport
    {
        $stateBlob = $request->query->getString('state');
        $statePayload = $this->loginStateSerializer->decode($stateBlob);
        if (null === $statePayload) {
            throw new AuthenticationException('Paramètre state OAuth2 invalide ou expiré.');
        }

        $request->attributes->set(self::REQUEST_ATTR_STATE, $statePayload);
        $nonce = $statePayload['nonce'] ?? null;
        if (!is_string($nonce) || '' === $nonce || !hash_equals($nonce, $request->cookies->getString(self::STATE_COOKIE_NAME))) {
            throw new AuthenticationException('Paramètre state OAuth2 ouvert par un autre navigateur.');
        }

        $keycloakClient = $this->clientRegistry->getClient('keycloak');

        try {
            $accessToken = $this->fetchAccessToken($keycloakClient);
        } catch (\UnexpectedValueException $ex) {
            $message = "Authentication failed, unable to get token from keycloak : {$ex->getMessage()}";
            $this->logger->critical('{class}: {message}', ['class' => self::class, 'message' => $message]);

            throw new AuthenticationException($message, Response::HTTP_UNAUTHORIZED, $ex);
        }

        $this->tokenManager->setAccessToken($accessToken);

        // un ID token incomplet ne doit jamais entrer dans le cookie : Keycloak reconnecterait le même compte en boucle
        try {
            $this->userProvider->loadUser();
        } catch (\UnexpectedValueException $ex) {
            $this->logger->error('{class}: {message}', ['class' => self::class, 'message' => $ex->getMessage()]);
            $this->tokenManager->clearAccessToken();

            throw new AuthenticationException($ex->getMessage(), Response::HTTP_UNAUTHORIZED, $ex);
        }

        return new SelfValidatingPassport(new UserBadge($accessToken->getToken()));
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        $statePayload = $request->attributes->get(self::REQUEST_ATTR_STATE, []);
        $referer = $statePayload['referer'] ?? null;
        $redirectUrl = match (true) {
            $this->isPopup($statePayload) => $this->router->generate(self::POPUP_CALLBACK_ROUTE),
            is_string($referer) && str_starts_with($referer, $request->getSchemeAndHttpHost().'/') => $referer,
            default => $this->router->generate(self::HOME_ROUTE, [], RouterInterface::ABSOLUTE_URL),
        };

        // effacé sur succès seulement : un échec (autre onglet en cours de login) ne doit pas faire échouer le login qui détient le cookie
        $response = new RedirectResponse($redirectUrl);
        $response->headers->clearCookie(self::STATE_COOKIE_NAME, '/', null, true, true, Cookie::SAMESITE_LAX);

        return $response;
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $message = strtr($exception->getMessageKey(), $exception->getMessageData());
        $this->logger->info(self::class, [$message]);

        // shortcut: un state expiré (formulaire Keycloak ouvert plus de 5 min) perd le drapeau popup et affiche l’échec dans la popup, à revoir si des utilisateurs le signalent
        if ($this->isPopup($request->attributes->get(self::REQUEST_ATTR_STATE, []))) {
            return new RedirectResponse($this->router->generate(self::POPUP_CALLBACK_ROUTE));
        }

        return new RedirectResponse($this->router->generate(self::HOME_ROUTE).self::LOGIN_FAILED_PATH);
    }

    /** @param array<string, mixed> $statePayload */
    private function isPopup(array $statePayload): bool
    {
        return true === ($statePayload['popup'] ?? false);
    }
}
