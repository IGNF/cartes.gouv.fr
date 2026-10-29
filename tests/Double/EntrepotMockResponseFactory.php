<?php

namespace App\Tests\Double;

use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Contracts\HttpClient\ResponseInterface;

/**
 * Réponses de l’API Entrepôt en environnement test (branché via framework.http_client.mock_response_factory).
 */
final class EntrepotMockResponseFactory
{
    public const USER_ID = 'entrepot-user-1';

    /** @param array<string, mixed> $options */
    public function __invoke(string $method, string $url, array $options): ResponseInterface
    {
        $path = (string) parse_url($url, PHP_URL_PATH);

        // l’Entrepôt autorise par le jeton de l’utilisateur : une requête sans le jeton attendu est refusée comme en vrai
        $authorization = $options['normalized_headers']['authorization'][0] ?? '';
        if ('Authorization: Bearer '.FakeKeycloakClient::ACCESS_TOKEN !== $authorization) {
            return self::json(['error' => 'Unauthorized', 'error_description' => 'Jeton absent ou inattendu'], 401);
        }

        if ('GET' === $method && str_ends_with($path, '/users/me')) {
            return self::json([
                '_id' => self::USER_ID,
                'email' => FakeKeycloakClient::DEFAULT_RESOURCE_OWNER['email'],
                'creation' => '2026-01-01T00:00:00Z',
                'last_login' => '2026-10-29T08:00:00Z',
                'communities_member' => [],
                'documents_quota' => 10,
                'documents_use' => 0,
                'keys_quota' => 10,
                'keys_use' => 0,
            ]);
        }

        return self::json(['error' => 'NotFound', 'error_description' => "Aucune réponse simulée pour $method $path"], 404);
    }

    /** @param array<string, mixed> $body */
    private static function json(array $body, int $status = 200): MockResponse
    {
        return new MockResponse(json_encode($body, JSON_THROW_ON_ERROR), [
            'http_code' => $status,
            'response_headers' => ['content-type' => 'application/json'],
        ]);
    }
}
