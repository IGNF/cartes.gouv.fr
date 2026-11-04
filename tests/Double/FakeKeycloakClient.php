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
        'sub' => EntrepotMockResponseFactory::USER_ID,
        'email' => 'test@example.com',
        'preferred_username' => 'test',
        'given_name' => 'Test',
        'family_name' => 'User',
    ];

    private static ?\Throwable $nextTokenException = null;

    public static function reset(): void
    {
        self::$nextTokenException = null;
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
            'id_token' => self::idToken(self::DEFAULT_RESOURCE_OWNER),
        ]);
    }

    /**
     * ID token à charge réelle ; en-tête et signature factices, comme le lit l'application (sans vérification).
     *
     * @param array<string, mixed> $claims
     */
    public static function idToken(array $claims): string
    {
        $encode = fn (string $json) => rtrim(strtr(base64_encode($json), '+/', '-_'), '=');

        return $encode('{"alg":"none"}').'.'.$encode((string) json_encode($claims)).'.signature';
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

    public function fetchUser(): KeycloakResourceOwner
    {
        return new KeycloakResourceOwner(self::DEFAULT_RESOURCE_OWNER);
    }
}
