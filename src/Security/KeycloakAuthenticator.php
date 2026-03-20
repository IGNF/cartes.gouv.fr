<?php

namespace App\Security;

use App\Controller\ApiControllerInterface;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\OAuth2ClientInterface;
use KnpU\OAuth2ClientBundle\Client\Provider\KeycloakClient;
use KnpU\OAuth2ClientBundle\Security\Authenticator\OAuth2Authenticator;
use League\OAuth2\Client\Token\AccessToken;
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
use Symfony\Component\Security\Http\Util\TargetPathTrait;

class KeycloakAuthenticator extends OAuth2Authenticator implements AuthenticationEntryPointInterface
{
    use TargetPathTrait;

    public const LOGIN_ROUTE = 'cartesgouvfr_security_login';
    public const LOGIN_CHECK_ROUTE = 'cartesgouvfr_security_login_check';
    public const SUCCESS_ROUTE = 'cartesgouvfr_app';
    public const HOME_ROUTE = 'cartesgouvfr_app';
    private const API_ROUTE_PREFIX = 'cartesgouvfr_api_';

    public function __construct(
        private ClientRegistry $clientRegistry,
        private RouterInterface $router,
        private KeycloakTokenManager $tokenManager,
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
        /** @var OAuth2ClientInterface|KeycloakClient */
        $keycloakClient = $this->clientRegistry->getClient('keycloak');

        try {
            /** @var AccessToken */
            $accessToken = $this->fetchAccessToken($keycloakClient);
        } catch (\UnexpectedValueException $ex) {
            $message = "Authentication failed, unable to get token from keycloak : {$ex->getMessage()}";
            $this->logger->critical('{class}: {message}', ['class' => self::class, 'message' => $message]);

            throw new AuthenticationException($message, Response::HTTP_UNAUTHORIZED, $ex);
        }

        $this->tokenManager->setToken($accessToken);

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

        $sessionExpired = $request->getSession()->get('session_expired');

        $app = $request->getSession()->get('app', null);
        if (!is_null($app) && 'entree-carto' === $app) {
            return $this->handleEntreeCartoLogin($request, true);
        }

        if (!is_null($app) && 'guichet-collaboratif' === $app) {
            return $this->handleGuichetCollaboratifLogin($request, true);
        }

        if (!is_null($sessionExpired) && 1 === intval($sessionExpired)) {
            $redirectUrl = $this->router->generate(self::HOME_ROUTE, [], RouterInterface::ABSOLUTE_URL).'decouvrir?session_expired_login_success=1';

            $request->getSession()->remove('session_expired');
        } else {
            $redirectUrl = $referer ?? $targetPath ?? $this->router->generate(self::SUCCESS_ROUTE, [], RouterInterface::ABSOLUTE_URL);
            $redirectUrl = str_replace('authentication_failed=1', '', $redirectUrl);

            // redirection vers le tableau de bord
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

        return new RedirectResponse($this->router->generate(self::HOME_ROUTE, [
            'authentication_failed' => true,
        ]).'/decouvrir');
    }

    private function isApiRequest(Request $request): bool
    {
        $route = $request->attributes->get('_route');

        return is_string($route) && str_starts_with($route, self::API_ROUTE_PREFIX);
    }

    /**
     * @SuppressWarnings(UndefinedVariable)
     */
    private function getUnauthorizedApiResponse(string $message = 'Unauthorized'): JsonResponse
    {
        $code = Response::HTTP_UNAUTHORIZED;

        return new JsonResponse([
            'code' => $code,
            'status' => Response::$statusTexts[$code] ?? 'Unauthorized',
            'message' => $message,
            'details' => ['controller' => ApiControllerInterface::class, 'session_expired' => true],
        ], $code);
    }

    // TODO : A refactoriser
    public function handleEntreeCartoLogin(Request $request, bool $success): Response
    {
        $redirectUrl = $this->router->generate(self::SUCCESS_ROUTE, [], RouterInterface::ABSOLUTE_URL);
        $redirectUrl .= 'explorer-les-cartes/login?';

        if (true === $success) {
            $redirectUrl .= 'success=1';
        } else {
            $redirectUrl .= 'authentication_failed=1';
        }
        $request->getSession()->remove('app');

        return new RedirectResponse($redirectUrl);
    }

    public function handleGuichetCollaboratifLogin(Request $request, bool $success): Response
    {
        $redirectUrl = $this->router->generate(self::SUCCESS_ROUTE, [], RouterInterface::ABSOLUTE_URL);
        $redirectUrl .= 'guichet-collaboratif/login?';

        if (true === $success) {
            $redirectUrl .= 'success=1';
        } else {
            $redirectUrl .= 'authentication_failed=1';
        }
        $request->getSession()->remove('app');

        return new RedirectResponse($redirectUrl);
    }
}
