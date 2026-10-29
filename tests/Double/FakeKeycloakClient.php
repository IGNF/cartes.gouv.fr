<?php

namespace App\Tests\Double;

use KnpU\OAuth2ClientBundle\Client\Provider\KeycloakClient;
use League\OAuth2\Client\Token\AccessToken;
use Stevenmaguire\OAuth2\Client\Provider\KeycloakResourceOwner;

/**
 * Double du client Keycloak en environnement test : aucun appel réseau.
 * L’état est statique car le client de test redémarre le noyau entre deux requêtes.
 */
final class FakeKeycloakClient extends KeycloakClient
{
    public const ACCESS_TOKEN = 'fake-access-token';

    public const DEFAULT_RESOURCE_OWNER = [
        'sub' => 'kc-user-1',
        'email' => 'test@example.com',
        'preferred_username' => 'test',
        'given_name' => 'Test',
        'family_name' => 'User',
    ];

    private static ?\Throwable $nextTokenException = null;
    private static ?AccessToken $nextAccessToken = null;

    public static function reset(): void
    {
        self::$nextTokenException = null;
        self::$nextAccessToken = null;
    }

    public static function failNextTokenExchange(\Throwable $exception): void
    {
        self::$nextTokenException = $exception;
    }

    public static function returnNextAccessToken(AccessToken $accessToken): void
    {
        self::$nextAccessToken = $accessToken;
    }

    public static function createAccessToken(int $lifetimeSeconds = 3600): AccessToken
    {
        return new AccessToken([
            'access_token' => self::ACCESS_TOKEN,
            'expires' => time() + $lifetimeSeconds,
            'id_token' => 'fake-id-token',
        ]);
    }

    public function getAccessToken(array $options = []): AccessToken
    {
        if (null !== self::$nextTokenException) {
            $exception = self::$nextTokenException;
            self::$nextTokenException = null;
            throw $exception;
        }

        return self::$nextAccessToken ?? self::createAccessToken();
    }

    public function fetchUserFromToken(AccessToken $accessToken): KeycloakResourceOwner
    {
        return new KeycloakResourceOwner(self::DEFAULT_RESOURCE_OWNER);
    }

    public function fetchUser(): KeycloakResourceOwner
    {
        return new KeycloakResourceOwner(self::DEFAULT_RESOURCE_OWNER);
    }
}
