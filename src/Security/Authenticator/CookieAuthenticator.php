<?php

namespace App\Security\Authenticator;

use App\Controller\ApiControllerInterface;
use App\Security\Cookie\AuthCookieResponseListener;
use App\Security\KeycloakTokenManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

final class CookieAuthenticator extends AbstractAuthenticator
{
    private const API_ROUTE_PREFIX = 'cartesgouvfr_api_';
    private const LOGIN_CHECK_ROUTE = 'cartesgouvfr_security_login_check';
    private const LOGIN_ROUTE = 'cartesgouvfr_security_login';

    public function __construct(
        private KeycloakTokenManager $tokenManager,
        private RouterInterface $router,
    ) {
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function supports(Request $request): bool
    {
        if (self::LOGIN_CHECK_ROUTE === $request->attributes->get('_route')) {
            return false;
        }

        if ($request->cookies->has(AuthCookieResponseListener::COOKIE_NAME)) {
            return true;
        }

        // Sans cookie, s'activer quand même sur les routes API pour pouvoir renvoyer le 401 JSON attendu.
        $route = $request->attributes->get('_route');

        return is_string($route) && str_starts_with($route, self::API_ROUTE_PREFIX);
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function authenticate(Request $request): Passport
    {
        $token = $this->tokenManager->getAccessToken();

        if (null === $token || $token->hasExpired()) {
            throw new AuthenticationException('Cookie absent, invalide ou expiré.');
        }

        return new SelfValidatingPassport(new UserBadge($token->getToken()));
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        if ($request->cookies->has(AuthCookieResponseListener::COOKIE_NAME)) {
            $this->tokenManager->clearAccessToken();
        }

        $route = $request->attributes->get('_route');
        if (is_string($route) && str_starts_with($route, self::API_ROUTE_PREFIX)) {
            $code = Response::HTTP_UNAUTHORIZED;

            return new JsonResponse([
                'code' => $code,
                'status' => 'Unauthorized',
                'message' => strtr($exception->getMessageKey(), $exception->getMessageData()),
                'details' => ['controller' => ApiControllerInterface::class, 'session_expired' => true],
            ], $code);
        }

        return new RedirectResponse($this->router->generate(self::LOGIN_ROUTE, ['session_expired' => 1]));
    }
}
