<?php

namespace App\Security;

use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\OAuth2ClientInterface;
use KnpU\OAuth2ClientBundle\Client\Provider\KeycloakClient;
use KnpU\OAuth2ClientBundle\Security\Authenticator\OAuth2Authenticator;
use League\OAuth2\Client\Token\AccessToken;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;
use Symfony\Component\Security\Http\Util\TargetPathTrait;

class KeycloakAuthenticator extends OAuth2Authenticator implements AuthenticationEntryPointInterface
{
    use TargetPathTrait;

    public const LOGIN_ROUTE = 'cartesgouvfr_security_login';
    public const LOGIN_CHECK_ROUTE = 'cartesgouvfr_security_login_check';
    public const SUCCESS_ROUTE = 'cartesgouvfr_app';
    public const HOME_ROUTE = 'cartesgouvfr_app';

    public function __construct(
        private ClientRegistry $clientRegistry,
        private RouterInterface $router,
        private RequestStack $requestStack,
        private LoggerInterface $logger,
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
        /** @var OAuth2ClientInterface|KeycloakClient */
        $keycloakClient = $this->clientRegistry->getClient('keycloak');

        /** @var AccessToken */
        $accessToken = $this->fetchAccessToken($keycloakClient);

        $this->requestStack->getSession()->set(KeycloakToken::SESSION_KEY, $accessToken);

        $userBadge = new UserBadge($accessToken->getToken());

        return new SelfValidatingPassport($userBadge);
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        $referer = $request->getSession()->get('referer', null);
        $targetPath = $this->getTargetPath($request->getSession(), $firewallName);

        $redirectUrl = $referer ?? $targetPath ?? $this->router->generate(self::SUCCESS_ROUTE);
        $redirectUrl = str_replace('authentication_failed=1', '', $redirectUrl);

        return new RedirectResponse($redirectUrl);
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $message = strtr($exception->getMessageKey(), $exception->getMessageData());

        $this->logger->debug(self::class, [$message]);

        return new RedirectResponse($this->router->generate(self::HOME_ROUTE, [
            'authentication_failed' => true,
        ]));
    }
}
