<?php

namespace App\Tests\Double;

use KnpU\OAuth2ClientBundle\Client\Provider\KeycloakClient;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use League\OAuth2\Client\Token\AccessToken;
use Stevenmaguire\OAuth2\Client\Provider\KeycloakResourceOwner;

/**
 * Double du client Keycloak en environnement test : aucun appel réseau.
 * L’état est statique car le client de test redémarre le noyau entre deux requêtes.
 */
final class FakeKeycloakClient extends KeycloakClient
{
    public const ACCESS_TOKEN = 'fake-access-token';

    /** réponse userinfo ; `sub` est aussi l’identifiant utilisateur de l’Entrepôt */
    public const USER_INFO = [
        'sub' => 'kc-user-1',
        'email' => 'test@example.com',
        'preferred_username' => 'test',
        'given_name' => 'Test',
        'family_name' => 'User',
    ];

    private static ?\Throwable $nextTokenException = null;
    private static bool $sessionRevoked = false;
    private static int $userInfoCalls = 0;

    public static function reset(): void
    {
        self::$nextTokenException = null;
        self::$sessionRevoked = false;
        self::$userInfoCalls = 0;
    }

    /** la session Keycloak est fermée : userinfo refuse le jeton */
    public static function revokeSession(): void
    {
        self::$sessionRevoked = true;
    }

    public static function userInfoCalls(): int
    {
        return self::$userInfoCalls;
    }

    public static function failNextTokenExchange(\Throwable $exception): void
    {
        self::$nextTokenException = $exception;
    }

    public static function createAccessToken(int $lifetimeSeconds = 3600): AccessToken
    {
        return new AccessToken([
            'access_token' => self::ACCESS_TOKEN,
            'expires' => time() + $lifetimeSeconds,
            'id_token' => 'fake-id-token',
        ]);
    }

    /** @param array<string, mixed> $options */
    public function getAccessToken(array $options = []): AccessToken
    {
        if (self::$nextTokenException instanceof \Throwable) {
            $exception = self::$nextTokenException;
            self::$nextTokenException = null;
            throw $exception;
        }

        return self::createAccessToken();
    }

    public function fetchUserFromToken(AccessToken $accessToken): KeycloakResourceOwner
    {
        ++self::$userInfoCalls;
        if (self::$sessionRevoked) {
            throw new IdentityProviderException('Session fermée', 401, '');
        }

        return new KeycloakResourceOwner(self::USER_INFO);
    }
}
