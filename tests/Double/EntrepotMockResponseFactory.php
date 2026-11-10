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

    /** @var array<string, list<array<mixed>>> entités par collection (metadata, annexes, uploads, stored_data, offerings, configurations), conservées entre redémarrages du noyau */
    private static array $store = [];

    /** @var array<string, string> contenu XML des métadonnées écrites, par identifiant */
    private static array $metadataFiles = [];

    /** @var list<string> requêtes « MÉTHODE chemin » qui répondent 500 à leur prochain passage */
    private static array $failures = [];

    private static int $nextId = 1;

    private static int $usersMeCalls = 0;
    private static bool $usersMeDown = false;
    private static string $usersMeId = self::USER_ID;

    public static function reset(): void
    {
        self::$writeRequests = [];
        self::$store = [];
        self::$metadataFiles = [];
        self::$failures = [];
        self::$nextId = 1;
        self::$usersMeCalls = 0;
        self::$usersMeDown = false;
        self::$usersMeId = self::USER_ID;
    }

    /**
     * Entités renvoyées par les listes et lectures de l’Entrepôt simulé.
     *
     * @param array<mixed> $entity
     */
    public static function seed(string $collection, array $entity, ?string $metadataXml = null): void
    {
        self::$store[$collection][] = $entity;
        if (null !== $metadataXml) {
            self::$metadataFiles[$entity['_id']] = $metadataXml;
        }
    }

    /** @return list<array<mixed>> */
    public static function stored(string $collection): array
    {
        return self::$store[$collection] ?? [];
    }

    public static function writtenMetadataFile(string $metadataId): ?string
    {
        return self::$metadataFiles[$metadataId] ?? null;
    }

    // la prochaine requête « MÉTHODE chemin relatif au datastore » répond 500 (ex. « POST metadata »)
    public static function failNext(string $request): void
    {
        self::$failures[] = $request;
    }

    // GET users/me répond pour un autre utilisateur jusqu’au prochain reset()
    public static function answerUsersMeFor(string $userId): void
    {
        self::$usersMeId = $userId;
    }

    public static function usersMeCalls(): int
    {
        return self::$usersMeCalls;
    }

    // GET users/me répond 503 jusqu’au prochain reset()
    public static function takeUsersMeDown(): void
    {
        self::$usersMeDown = true;
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
            ++self::$usersMeCalls;
            if (self::$usersMeDown) {
                return $this->json(['error' => 'Service Unavailable'], 503);
            }

            return $this->json([
                '_id' => self::$usersMeId,
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

        if (self::ENTREPOT_HOST === $host && str_starts_with($path, $datastorePath)) {
            $response = $this->datastoreResponse($method, substr($path, strlen($datastorePath)), (string) parse_url($url, PHP_URL_QUERY), $options);
            if (null !== $response) {
                return $response;
            }
        }

        if (self::ENTREPOT_HOST === $host && 'POST' === $method && str_ends_with($path, '/users/me/documents')) {
            self::$writeRequests[] = ['method' => $method, 'path' => $path, 'body' => $this->drainBody($options['body'] ?? '')];

            return $this->json(['_id' => 'doc-1', 'name' => 'document'], 201);
        }

        return $this->json(['error' => 'NotFound', 'error_description' => "Aucune réponse simulée pour $method $path"], 404);
    }

    /**
     * @param array<string, mixed> $options
     */
    private function datastoreResponse(string $method, string $path, string $queryString, array $options): ?MockResponse
    {
        $relative = ltrim($path, '/');
        $failure = array_search("$method $relative", self::$failures, true);
        if (false !== $failure) {
            array_splice(self::$failures, $failure, 1);

            return $this->json(['error' => 'Internal Server Error', 'error_description' => "Échec simulé de $method $relative"], 500);
        }

        if ('GET' === $method && '' === $relative) {
            return $this->json(['_id' => self::DATASTORE_ID, 'name' => 'Entrepôt test', 'technical_name' => 'entrepot_test', 'community' => ['_id' => 'community-1']]);
        }

        parse_str($queryString, $query);

        if ('GET' === $method && 1 === preg_match('#^(processings/executions|offerings|configurations|metadata|statics|annexes|stored_data|uploads)$#', $relative)) {
            $items = array_values(array_filter(self::$store[$relative] ?? [], fn (array $item) => $this->matches($item, $query)));

            return $this->json($items, 200, ['content-range' => sprintf('0-%d/%d', max(count($items) - 1, 0), count($items))]);
        }

        if ('HEAD' === $method && 'metadata' === $relative) {
            $taken = [] !== array_filter(self::$store['metadata'] ?? [], fn (array $item) => ($item['file_identifier'] ?? null) === ($query['file_identifier'] ?? null));

            return new MockResponse('', ['http_code' => $taken ? 409 : 204]);
        }

        if ('GET' === $method && 1 === preg_match('#^metadata/([\w-]+)/file$#', $relative, $matches)) {
            return $this->metadataFileResponse($matches[1]);
        }

        if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            $body = $this->drainBody($options['body'] ?? '');
            self::$writeRequests[] = ['method' => $method, 'path' => $path, 'body' => $body];

            return $this->write($method, $relative, $body);
        }

        return null;
    }

    private function write(string $method, string $relative, string $body): ?MockResponse
    {
        if ('POST' === $method && 'metadata' === $relative) {
            $xml = $this->xmlPart($body);
            preg_match('#<gmd:fileIdentifier>\s*<gco:CharacterString>([^<]*)<#', $xml, $matches);
            $metadata = ['_id' => 'metadata-'.self::$nextId++, 'file_identifier' => $matches[1] ?? null, 'tags' => [], 'endpoints' => []];
            self::$store['metadata'][] = $metadata;
            self::$metadataFiles[$metadata['_id']] = $xml;

            return $this->json($metadata, 201);
        }

        if ('PUT' === $method && 1 === preg_match('#^metadata/([\w-]+)$#', $relative, $matches)) {
            self::$metadataFiles[$matches[1]] = $this->xmlPart($body);

            return $this->json($this->find('metadata', $matches[1]) ?? []);
        }

        if ('POST' === $method && 1 === preg_match('#^metadata/([\w-]+)/tags$#', $relative, $matches)) {
            return $this->json($this->update('metadata', $matches[1], fn (array $item) => ['tags' => [...$item['tags'], ...json_decode($body, true, flags: JSON_THROW_ON_ERROR)]] + $item));
        }

        if ('POST' === $method && 'annexes' === $relative) {
            preg_match('#name="paths"\r\n\r\n([^\r]*)#', $body, $matches);
            $annexe = ['_id' => 'annexe-'.self::$nextId++, 'paths' => explode(',', $matches[1] ?? ''), 'labels' => []];
            self::$store['annexes'][] = $annexe;

            return $this->json($annexe, 201);
        }

        if ('PATCH' === $method && 1 === preg_match('#^annexes/([\w-]+)$#', $relative, $matches)) {
            return $this->json($this->update('annexes', $matches[1], fn (array $item) => json_decode($body, true, flags: JSON_THROW_ON_ERROR) + $item));
        }

        if ('DELETE' === $method && 1 === preg_match('#^(annexes|metadata)/([\w-]+)$#', $relative, $matches)) {
            self::$store[$matches[1]] = array_values(array_filter(self::$store[$matches[1]] ?? [], fn (array $item) => $item['_id'] !== $matches[2]));

            return new MockResponse('', ['http_code' => 204]);
        }

        return null;
    }

    // filtres de liste de l’Entrepôt : tags[clé]=valeur, labels[]=clé=valeur
    /**
     * @param array<mixed> $item
     * @param array<mixed> $query
     */
    private function matches(array $item, array $query): bool
    {
        foreach ((array) ($query['tags'] ?? []) as $key => $value) {
            if (($item['tags'][$key] ?? null) !== $value) {
                return false;
            }
        }

        return [] === array_diff((array) ($query['labels'] ?? []), $item['labels'] ?? []);
    }

    /** @return array<mixed>|null */
    private function find(string $collection, string $id): ?array
    {
        foreach (self::$store[$collection] ?? [] as $item) {
            if ($item['_id'] === $id) {
                return $item;
            }
        }

        return null;
    }

    /**
     * @param \Closure(array<mixed>): array<mixed> $change
     *
     * @return array<mixed>
     */
    private function update(string $collection, string $id, \Closure $change): array
    {
        foreach (self::$store[$collection] ?? [] as $index => $item) {
            if ($item['_id'] === $id) {
                return self::$store[$collection][$index] = $change($item);
            }
        }

        return [];
    }

    // fichier XML d’un corps multipart
    private function xmlPart(string $body): string
    {
        return 1 === preg_match('#<\?xml.*</gmd:MD_Metadata>#s', $body, $matches) ? $matches[0] : $body;
    }

    private function metadataFileResponse(string $metadataId): MockResponse
    {
        if (isset(self::$metadataFiles[$metadataId])) {
            return new MockResponse(self::$metadataFiles[$metadataId], ['http_code' => 200, 'response_headers' => ['content-type' => 'application/xml']]);
        }

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
