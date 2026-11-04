<?php

namespace App\Security;

use League\OAuth2\Client\Token\AccessToken;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationExpiredException;
use Symfony\Component\Security\Core\Exception\TokenNotFoundException;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

/**
 * Construit l'utilisateur depuis l'ID token du cookie, sans appel à Keycloak ni à l'Entrepôt.
 *
 * @implements UserProviderInterface<User>
 */
class KeycloakUserProvider implements UserProviderInterface
{
    public function __construct(
        private readonly KeycloakTokenManager $tokenManager,
        private readonly LoggerInterface $logger,
    ) {
    }

    /**
     * @throws TokenNotFoundException         pas de jeton dans le cookie
     * @throws AuthenticationExpiredException ID token absent ou incomplet
     */
    public function loadUser(): User
    {
        if (!$this->tokenManager->getAccessToken() instanceof AccessToken) {
            $this->logger->debug('{class}: No token found', ['class' => self::class]);
            throw new TokenNotFoundException();
        }

        $claims = $this->decodeIdToken((string) $this->tokenManager->getIdToken());
        foreach (['sub', 'email', 'preferred_username'] as $claim) {
            if (!is_string($claims[$claim] ?? null) || '' === $claims[$claim]) {
                throw new AuthenticationExpiredException("ID token sans claim $claim");
            }
        }

        return new User(
            $claims['sub'],
            $claims['email'],
            $claims['preferred_username'],
            is_string($claims['given_name'] ?? null) ? $claims['given_name'] : null,
            is_string($claims['family_name'] ?? null) ? $claims['family_name'] : null,
        );
    }

    /**
     * Charge de l'ID token sans vérifier la signature : le cookie scellé en garantit l'origine.
     *
     * @return array<mixed>
     */
    private function decodeIdToken(string $idToken): array
    {
        $payload = explode('.', $idToken)[1] ?? '';
        $claims = json_decode((string) base64_decode(strtr($payload, '-_', '+/'), true), true);

        return is_array($claims) ? $claims : [];
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
