<?php

namespace App\Security;

use App\Services\EntrepotApi\UserApiService;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\Provider\KeycloakClient;
use Psr\Log\LoggerInterface;
use Stevenmaguire\OAuth2\Client\Provider\KeycloakResourceOwner;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpClient\Exception\TimeoutException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationExpiredException;
use Symfony\Component\Security\Core\Exception\TokenNotFoundException;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

/**
 * @implements UserProviderInterface<User>
 */
class KeycloakUserProvider implements UserProviderInterface
{
    public function __construct(
        private ClientRegistry $clientRegistry,
        private KeycloakTokenManager $tokenManager,
        private ParameterBagInterface $params,
        private UserApiService $userApiService,
        private LoggerInterface $logger,
        private CacheInterface $cache,
    ) {
    }

    public function loadUser(): User
    {
        //  création d'un utilisateur bidon si en mode test
        if ('test' === $this->params->get('app_env')) {
            return User::getTestUser();
        }

        /** @var KeycloakClient */
        $keycloakClient = $this->clientRegistry->getClient('keycloak');

        $accessToken = $this->tokenManager->getToken();
        if (null == $accessToken) {
            $this->logger->debug('{class}: No token found in session', ['class' => self::class]);
            throw new TokenNotFoundException();
        }

        try {
            /** @var KeycloakResourceOwner */
            $keycloakUser = $this->cache->get('keycloak-user-'.sha1((string) $accessToken), function (ItemInterface $item) use ($accessToken, $keycloakClient) {
                $item->expiresAfter(60);

                return $keycloakClient->fetchUserFromToken($accessToken);
            });
        } catch (\Throwable $th) {
            $this->logger->debug('{class}: Failed to fetch user from token', ['class' => self::class]);
            throw new AuthenticationExpiredException('Failed to fetch user from token', Response::HTTP_UNAUTHORIZED, $th);
        }

        $apiUser = $this->cache->get("users-{$keycloakUser->getId()}", function (ItemInterface $item) {
            $item->expiresAfter(60);

            try {
                return $this->userApiService->getMe()->json();
            } catch (TimeoutException $ex) {
                $this->logger->debug('{class}: Failed to fetch logged-in user', ['class' => self::class]);
                throw new UserNotFoundException('Failed to fetch logged-in user', Response::HTTP_UNAUTHORIZED, $ex);
            }
        });

        $user = new User($keycloakUser->toArray(), $apiUser);

        return $user;
    }

    /**
     * Symfony calls this method if you use features like switch_user
     * or remember_me.
     *
     * If you're not using these features, you do not need to implement
     * this method.
     *
     * {@inheritDoc}
     *
     * @throws UserNotFoundException if the user is not found
     */
    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        return $this->loadUser();
    }

    /**
     * @deprecated since Symfony 5.3, loadUserByIdentifier() is used instead
     */
    public function loadUserByUsername(string $username): UserInterface
    {
        return $this->loadUserByIdentifier($username);
    }

    /**
     * Refreshes the user after being reloaded from the session.
     *
     * When a user is logged in, at the beginning of each request, the
     * User object is loaded from the session and then this method is
     * called. Your job is to make sure the user's data is still fresh by,
     * for example, re-querying for fresh User data.
     *
     * If your firewall is "stateless: true" (for a pure API), this
     * method is not called.
     */
    public function refreshUser(UserInterface $user): UserInterface
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Invalid user class "%s".', get_class($user)));
        }

        if (null === $this->tokenManager->getToken()) {
            throw new AuthenticationExpiredException('No token in session');
        }

        return $user;
    }

    /**
     * Tells Symfony to use this provider for this User class.
     */
    public function supportsClass(string $class): bool
    {
        return User::class === $class || is_subclass_of($class, User::class);
    }
}
