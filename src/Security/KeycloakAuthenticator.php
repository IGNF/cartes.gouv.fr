<?php

namespace App\Security;

use App\Security\State\LoginStateSerializer;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Security\Authenticator\OAuth2Authenticator;
use Psr\Log\LoggerInterface;
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
    public const SUCCESS_ROUTE = 'cartesgouvfr_app';
    public const HOME_ROUTE = 'cartesgouvfr_app';
    private const REQUEST_ATTR_STATE = '_login_state';

    public function __construct(
        private readonly ClientRegistry $clientRegistry,
        private readonly RouterInterface $router,
        private readonly KeycloakTokenManager $tokenManager,
        private readonly LoginStateSerializer $loginStateSerializer,
        private readonly LoggerInterface $logger,
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
        $keycloakClient = $this->clientRegistry->getClient('keycloak');

        try {
            $accessToken = $this->fetchAccessToken($keycloakClient);
        } catch (\UnexpectedValueException $ex) {
            $message = "Authentication failed, unable to get token from keycloak : {$ex->getMessage()}";
            $this->logger->critical('{class}: {message}', ['class' => self::class, 'message' => $message]);

            throw new AuthenticationException($message, Response::HTTP_UNAUTHORIZED, $ex);
        }

        $this->tokenManager->setAccessToken($accessToken);

        return new SelfValidatingPassport(new UserBadge($accessToken->getToken()));
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        $statePayload = $request->attributes->get(self::REQUEST_ATTR_STATE, []);

        $sessionExpired = $statePayload['session_expired'] ?? null;
        $referer = $statePayload['referer'] ?? null;
        if (!is_string($referer) || parse_url($referer, PHP_URL_HOST) !== $request->getHost()) {
            $referer = null;
        }

        if (!is_null($sessionExpired) && 1 === intval($sessionExpired)) {
            $redirectUrl = $this->router->generate(self::HOME_ROUTE, [], RouterInterface::ABSOLUTE_URL).'publier-une-donnee?session_expired_login_success=1';
        } else {
            $redirectUrl = $referer ?? $this->router->generate(self::SUCCESS_ROUTE, [], RouterInterface::ABSOLUTE_URL);
            $redirectUrl = str_replace('authentication_failed=1', '', $redirectUrl);

            if (in_array(parse_url($redirectUrl, PHP_URL_PATH), ['/decouvrir', '/publier-une-donnee'])) {
                $redirectUrl = $this->router->generate(self::SUCCESS_ROUTE, [], RouterInterface::ABSOLUTE_URL);
                $redirectUrl .= 'tableau-de-bord';
            }
        }

        return new RedirectResponse($redirectUrl);
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $message = strtr($exception->getMessageKey(), $exception->getMessageData());
        $this->logger->info(self::class, [$message]);
        // un jeton déjà reçu (session Keycloak fermée, ID token illisible) ne doit pas finir dans le cookie
        $this->tokenManager->clearAccessToken();

        return new RedirectResponse($this->router->generate(self::HOME_ROUTE).'publier-une-donnee?authentication_failed=1');
    }
}
