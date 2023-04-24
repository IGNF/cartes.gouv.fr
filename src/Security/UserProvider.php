<?php

namespace App\Security;

use App\Services\EntrepotApiService;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\Provider\KeycloakClient;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use League\OAuth2\Client\Token\AccessToken;
use Stevenmaguire\OAuth2\Client\Provider\KeycloakResourceOwner;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationExpiredException;
use Symfony\Component\Security\Core\Exception\TokenNotFoundException;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class UserProvider implements UserProviderInterface
{
    private ClientRegistry $clientRegistry;
    private RequestStack $requestStack;
    private EntrepotApiService $entrepotApiService;

    public function __construct(ClientRegistry $clientRegistry, RequestStack $requestStack, EntrepotApiService $entrepotApiService)
    {
        $this->clientRegistry = $clientRegistry;
        $this->requestStack = $requestStack;
        $this->entrepotApiService = $entrepotApiService;
    }

    public function loadUser()
    {
        /** @var KeycloakClient */
        $keycloakClient = $this->clientRegistry->getClient('keycloak');

        /** @var SessionInterface */
        $session = $this->requestStack->getSession();

        /** @var AccessToken */
        $accessToken = $session->get(KeycloakToken::SESSION_KEY);
        if (null == $accessToken) {
            throw new TokenNotFoundException();
        }

        if ($accessToken->hasExpired()) {
            try {
                /** @var AccessToken */
                $accessToken = $keycloakClient->refreshAccessToken($accessToken->getRefreshToken());
                $session->set(KeycloakToken::SESSION_KEY, $accessToken);
            } catch (IdentityProviderException $ex) {
                throw new AuthenticationExpiredException('Unable to refresh keycloak access token', Response::HTTP_UNAUTHORIZED, $ex);
            }
        }

        /** @var KeycloakResourceOwner */
        $keycloakUser = $keycloakClient->fetchUserFromToken($accessToken);

        $apiUser = $this->entrepotApiService->getUserMe();

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
     * @throws UserNotFoundException if the user is not found
     */
    public function loadUserByIdentifier($identifier): UserInterface
    {
        return $this->loadUser();
    }

    /**
     * @deprecated since Symfony 5.3, loadUserByIdentifier() is used instead
     */
    public function loadUserByUsername($username): UserInterface
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

        return $this->loadUser();
    }

    /**
     * Tells Symfony to use this provider for this User class.
     */
    public function supportsClass(string $class): bool
    {
        return User::class === $class || is_subclass_of($class, User::class);
    }
}
