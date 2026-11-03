<?php

namespace App\Security;

use App\Security\Token\JwtClaims;
use League\OAuth2\Client\Token\AccessToken;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationExpiredException;
use Symfony\Component\Security\Core\Exception\TokenNotFoundException;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

/**
 * @implements UserProviderInterface<User>
 */
class KeycloakUserProvider implements UserProviderInterface
{
    public function __construct(
        private readonly KeycloakTokenManager $tokenManager,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function loadUser(): User
    {
        $accessToken = $this->tokenManager->getAccessToken();
        if (!$accessToken instanceof AccessToken) {
            $this->logger->debug('{class}: No token found', ['class' => self::class]);
            throw new TokenNotFoundException();
        }

        $idToken = $accessToken->getValues()['id_token'] ?? null;
        $claims = \is_string($idToken) ? JwtClaims::fromJwt($idToken) : [];
        if ([] === $claims) {
            $this->logger->debug('{class}: ID token absent ou illisible', ['class' => self::class]);
            throw new AuthenticationExpiredException('ID token absent ou illisible', Response::HTTP_UNAUTHORIZED);
        }

        return new User($claims, (int) $accessToken->getExpires());
    }

    /**
     * Symfony calls this method if you use features like switch_user
     * or remember_me.
     *
     * If you're not using these features, you do not need to implement
     * this method.
     *
     * {@inheritDoc}
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
            throw new UnsupportedUserException(sprintf('Invalid user class "%s".', $user::class));
        }

        $token = $this->tokenManager->getAccessToken();
        if (!$token instanceof AccessToken) {
            $this->logger->debug('{class}: No token found during refreshUser', ['class' => self::class]);
            throw new AuthenticationExpiredException('No token found');
        }
        if ($token->hasExpired()) {
            $this->logger->debug('{class}: Token expired during refreshUser', ['class' => self::class]);
            throw new AuthenticationExpiredException('Token expired');
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
