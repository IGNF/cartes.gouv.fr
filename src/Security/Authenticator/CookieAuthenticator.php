<?php

namespace App\Security\Authenticator;

use App\Security\Cookie\AuthCookieResponseListener;
use App\Security\KeycloakTokenManager;
use League\OAuth2\Client\Token\AccessToken;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
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
    private const LOGIN_CHECK_ROUTE = 'cartesgouvfr_security_login_check';
    private const LOGIN_ROUTE = 'cartesgouvfr_security_login';

    public function __construct(
        private readonly KeycloakTokenManager $tokenManager,
        private readonly RouterInterface $router,
        #[Autowire(param: 'app.api_path_pattern')]
        private readonly string $apiPathPattern,
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

        return $request->cookies->has(AuthCookieResponseListener::COOKIE_NAME);
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function authenticate(Request $request): Passport
    {
        $token = $this->tokenManager->getAccessToken();

        if (!$token instanceof AccessToken || $token->hasExpired()) {
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

    /**
     * @SuppressWarnings(UnusedFormalParameter) signature imposée par l'interface
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $this->tokenManager->clearAccessToken();

        // route d'API : laisser le pare-feu continuer sans jeton, le contrôle d'accès appelle le point d'entrée qui produit le 401
        if (1 === preg_match('{'.$this->apiPathPattern.'}', $request->getPathInfo())) {
            return null;
        }

        return new RedirectResponse($this->router->generate(self::LOGIN_ROUTE, ['session_expired' => 1]));
    }
}
