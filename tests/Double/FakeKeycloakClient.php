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

    /** claims de l’ID token ; `sub` est aussi l’identifiant utilisateur de l’Entrepôt */
    public const ID_TOKEN_CLAIMS = [
        'sub' => 'kc-user-1',
        'email' => 'test@example.com',
        'preferred_username' => 'test',
        'given_name' => 'Test',
        'family_name' => 'User',
    ];

    private static ?\Throwable $nextTokenException = null;
    private static bool $sessionRevoked = false;
    private static int $userInfoCalls = 0;
    /** @var array<string, mixed>|null */
    private static ?array $idTokenClaims = null;

    public static function reset(): void
    {
        self::$nextTokenException = null;
        self::$sessionRevoked = false;
        self::$userInfoCalls = 0;
        self::$idTokenClaims = null;
    }

    /** @param array<string, mixed> $claims claims de l’ID token du prochain échange de code */
    public static function useIdTokenClaims(array $claims): void
    {
        self::$idTokenClaims = $claims;
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

    /** @param array<string, mixed> $idTokenClaims */
    public static function createAccessToken(int $lifetimeSeconds = 3600, array $idTokenClaims = self::ID_TOKEN_CLAIMS): AccessToken
    {
        return new AccessToken([
            'access_token' => self::ACCESS_TOKEN,
            'expires' => time() + $lifetimeSeconds,
            'id_token' => self::jwt($idTokenClaims),
        ]);
    }

    /**
     * JWT compact non signé : l’application lit les claims sans vérifier la signature.
     *
     * @param array<string, mixed> $claims
     */
    public static function jwt(array $claims): string
    {
        $encode = fn (array $data): string => rtrim(strtr(base64_encode(json_encode($data, JSON_THROW_ON_ERROR)), '+/', '-_'), '=');

        return $encode(['alg' => 'none', 'typ' => 'JWT']).'.'.$encode($claims).'.signature';
    }

    /** @param array<string, mixed> $options */
    public function getAccessToken(array $options = []): AccessToken
    {
        if (self::$nextTokenException instanceof \Throwable) {
            $exception = self::$nextTokenException;
            self::$nextTokenException = null;
            throw $exception;
        }

        return self::createAccessToken(idTokenClaims: self::$idTokenClaims ?? self::ID_TOKEN_CLAIMS);
    }

    // contrôle de vivacité de la session seulement : la réponse n’est pas lue par l’application
    public function fetchUserFromToken(AccessToken $accessToken): KeycloakResourceOwner
    {
        ++self::$userInfoCalls;
        if (self::$sessionRevoked) {
            throw new IdentityProviderException('Session fermée', 401, '');
        }

        return new KeycloakResourceOwner(['sub' => self::ID_TOKEN_CLAIMS['sub']]);
    }

    public function fetchUser(): KeycloakResourceOwner
    {
        throw new \LogicException('l’identité vient de l’ID token, pas de userinfo');
    }
}
