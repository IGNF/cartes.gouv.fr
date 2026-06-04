<?php

namespace App\Security;

use App\Controller\ApiControllerInterface;
use App\Security\State\LoginStateSerializer;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Security\Authenticator\OAuth2Authenticator;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
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
    private const API_ROUTE_PREFIX = 'cartesgouvfr_api_';
    private const REQUEST_ATTR_STATE = '_login_state';

    public function __construct(
        private ClientRegistry $clientRegistry,
        private RouterInterface $router,
        private KeycloakTokenManager $tokenManager,
        private LoginStateSerializer $loginStateSerializer,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * //
     * {@inheritDoc}
     */
    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        if ($this->isApiRequest($request)) {
            return $this->getUnauthorizedApiResponse();
        }

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
        $stateBlob = $request->query->get('state', '');
        if (!is_string($stateBlob)) {
            throw new AuthenticationException('Paramètre state OAuth2 invalide ou expiré.');
        }
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

        $app = $statePayload['app'] ?? null;
        $sessionExpired = $statePayload['session_expired'] ?? null;
        $referer = $statePayload['referer'] ?? null;
        if (!is_string($referer) || parse_url($referer, PHP_URL_HOST) !== $request->getHost()) {
            $referer = null;
        }

        if (!is_null($app) && 'entree-carto' === $app) {
            return $this->handleEntreeCartoLogin(true);
        }

        if (!is_null($app) && 'guichet-collaboratif' === $app) {
            return $this->handleGuichetCollaboratifLogin(true);
        }

        if (!is_null($sessionExpired) && 1 === intval($sessionExpired)) {
            $redirectUrl = $this->router->generate(self::HOME_ROUTE, [], RouterInterface::ABSOLUTE_URL).'/publier-une-donnee?session_expired_login_success=1';
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

        if ($this->isApiRequest($request)) {
            return $this->getUnauthorizedApiResponse($message);
        }

        return new RedirectResponse($this->router->generate(self::HOME_ROUTE).'publier-une-donnee?authentication_failed=1');
    }

    private function isApiRequest(Request $request): bool
    {
        $route = $request->attributes->get('_route');

        return is_string($route) && str_starts_with($route, self::API_ROUTE_PREFIX);
    }

    private function getUnauthorizedApiResponse(string $message = 'Unauthorized'): JsonResponse
    {
        $code = Response::HTTP_UNAUTHORIZED;

        return new JsonResponse([
            'code' => $code,
            'status' => 'Unauthorized',
            'message' => $message,
            'details' => ['controller' => ApiControllerInterface::class, 'session_expired' => true],
        ], $code);
    }

    public function handleEntreeCartoLogin(bool $success): Response
    {
        $redirectUrl = $this->router->generate(self::SUCCESS_ROUTE, [], RouterInterface::ABSOLUTE_URL);
        $redirectUrl .= 'explorer-les-cartes/login?';
        $redirectUrl .= $success ? 'success=1' : 'authentication_failed=1';

        return new RedirectResponse($redirectUrl);
    }

    public function handleGuichetCollaboratifLogin(bool $success): Response
    {
        $redirectUrl = $this->router->generate(self::SUCCESS_ROUTE, [], RouterInterface::ABSOLUTE_URL);
        $redirectUrl .= 'guichet-collaboratif/login?';
        $redirectUrl .= $success ? 'success=1' : 'authentication_failed=1';

        return new RedirectResponse($redirectUrl);
    }
}
