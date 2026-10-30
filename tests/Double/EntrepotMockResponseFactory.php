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
    public const DATASTORE_ID = 'ds-1';
    // fichier de métadonnée dont l’Entrepôt répond 502 en texte brut
    public const METADATA_ID_UPSTREAM_DOWN = 'upstream-down';
    private const ENTREPOT_HOST = 'entrepot.test';
    private const METADATA_FIXTURES_DIR = __DIR__.'/../Fixture/metadata';

    /** @var list<array{method: string, path: string, body: string}> requêtes d’écriture reçues, conservées entre redémarrages du noyau */
    private static array $writeRequests = [];

    public static function reset(): void
    {
        self::$writeRequests = [];
    }

    /** @return list<array{method: string, path: string, body: string}> */
    public static function writeRequests(): array
    {
        return self::$writeRequests;
    }

    /** @param array<string, mixed> $options */
    public function __invoke(string $method, string $url, array $options): ResponseInterface
    {
        $host = (string) parse_url($url, PHP_URL_HOST);
        $path = (string) parse_url($url, PHP_URL_PATH);

        // l’Entrepôt autorise par le jeton de l’utilisateur : une requête sans le jeton attendu est refusée comme en vrai
        $authorization = $options['normalized_headers']['authorization'][0] ?? '';
        if ('Authorization: Bearer '.FakeKeycloakClient::ACCESS_TOKEN !== $authorization) {
            return $this->json(['error' => 'Unauthorized', 'error_description' => 'Jeton absent ou inattendu'], 401);
        }

        if (self::ENTREPOT_HOST === $host && 'GET' === $method && str_ends_with($path, '/users/me')) {
            return $this->json([
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

        $datastorePath = '/api/datastores/'.self::DATASTORE_ID;

        if (self::ENTREPOT_HOST === $host && 'GET' === $method && $datastorePath.'/metadata' === $path) {
            return $this->json([], 200, ['content-range' => '0-0/0']);
        }

        if (self::ENTREPOT_HOST === $host && 'GET' === $method && 1 === preg_match('#^'.$datastorePath.'/metadata/([\w-]+)/file$#', $path, $matches)) {
            return $this->metadataFile($matches[1]);
        }

        if (self::ENTREPOT_HOST === $host && 'POST' === $method && str_ends_with($path, '/users/me/documents')) {
            self::$writeRequests[] = ['method' => $method, 'path' => $path, 'body' => $this->drainBody($options['body'] ?? '')];

            return $this->json(['_id' => 'doc-1', 'name' => 'document'], 201);
        }

        return $this->json(['error' => 'NotFound', 'error_description' => "Aucune réponse simulée pour $method $path"], 404);
    }

    private function metadataFile(string $metadataId): MockResponse
    {
        if (self::METADATA_ID_UPSTREAM_DOWN === $metadataId) {
            return new MockResponse('upstream down', ['http_code' => 502, 'response_headers' => ['content-type' => 'text/plain']]);
        }

        $fixture = self::METADATA_FIXTURES_DIR."/$metadataId.xml";
        if (!is_file($fixture)) {
            return $this->json(['error' => 'NotFound', 'error_description' => "Aucune fixture de métadonnée $metadataId"], 404);
        }

        return new MockResponse((string) file_get_contents($fixture), ['http_code' => 200, 'response_headers' => ['content-type' => 'application/xml']]);
    }

    // le corps multipart arrive sous forme de générateur : on le lit en entier pour pouvoir l’inspecter
    private function drainBody(mixed $body): string
    {
        if (is_string($body)) {
            return $body;
        }

        $raw = '';
        if ($body instanceof \Closure) {
            while ('' !== ($chunk = $body(8192))) {
                $raw .= $chunk;
            }
        } elseif (is_iterable($body)) {
            foreach ($body as $chunk) {
                $raw .= $chunk;
            }
        }

        return $raw;
    }

    /**
     * @param array<mixed>          $body
     * @param array<string, string> $headers
     */
    private function json(array $body, int $status = 200, array $headers = []): MockResponse
    {
        return new MockResponse(json_encode($body, JSON_THROW_ON_ERROR), [
            'http_code' => $status,
            'response_headers' => ['content-type' => 'application/json'] + $headers,
        ]);
    }
}
