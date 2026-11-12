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
    public const METADATA_ENDPOINT_ID = 'endpoint-metadata';
    public const WFS_PUBLIC_ENDPOINT_ID = 'endpoint-wfs-public';
    public const WFS_PRIVATE_ENDPOINT_ID = 'endpoint-wfs-private';
    public const WMSV_PUBLIC_ENDPOINT_ID = 'endpoint-wmsv-public';
    public const WMSR_PUBLIC_ENDPOINT_ID = 'endpoint-wmsr-public';
    public const LAYER_WITHOUT_LEGEND = 'couche_sans_legende';
    public const LEGEND_PNG = "\x89PNG légende";
    private const ENTREPOT_HOST = 'entrepot.test';
    private const METADATA_FIXTURES_DIR = __DIR__.'/../Fixture/metadata';

    /** @var list<array{method: string, path: string, body: string}> requêtes d’écriture reçues, conservées entre redémarrages du noyau */
    private static array $writeRequests = [];

    /** @var array<string, list<array<mixed>>> entités par collection (metadata, annexes, statics, uploads, stored_data, offerings, configurations), conservées entre redémarrages du noyau */
    private static array $store = [];

    /** @var array<string, string> contenu XML des métadonnées écrites, par identifiant */
    private static array $metadataFiles = [];

    /** @var list<array{string, int}> requêtes « MÉTHODE chemin » qui répondent 500, après le nombre de passages réussis indiqué */
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

    // la prochaine requête « MÉTHODE chemin relatif au datastore » répond 500 (ex. « POST metadata »), après $passes passages réussis
    public static function failNext(string $request, int $passes = 0): void
    {
        self::$failures[] = [$request, $passes];
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

        // jeton du compte de service (SandboxService)
        if ('POST' === $method && str_ends_with($path, '/token')) {
            return $this->json(['access_token' => FakeKeycloakClient::ACCESS_TOKEN, 'expires_in' => 300]);
        }

        // légende GetLegendGraphic d’un flux WMS-V : requête publique, sans jeton
        if ('GET' === $method && str_contains((string) parse_url($url, PHP_URL_QUERY), 'GetLegendGraphic')) {
            // couche que le WMS ne sait pas dessiner : ServiceException XML en 200, comme la Géoplateforme (mesuré le 12/11/2026)
            if (str_contains((string) parse_url($url, PHP_URL_QUERY), self::LAYER_WITHOUT_LEGEND)) {
                return new MockResponse('<ServiceExceptionReport/>', ['http_code' => 200, 'response_headers' => ['content-type' => 'text/xml;charset=UTF-8']]);
            }

            return new MockResponse(self::LEGEND_PNG, ['http_code' => 200, 'response_headers' => ['content-type' => 'image/png']]);
        }

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

        // communauté du bac à sable : son datastore n’est pas celui des tests
        if (self::ENTREPOT_HOST === $host && 'GET' === $method && str_ends_with($path, '/communities/sandbox-community')) {
            return $this->json(['_id' => 'sandbox-community', 'datastore' => ['_id' => 'sandbox-datastore']]);
        }

        $datastorePath = '/api/datastores/'.self::DATASTORE_ID;

        if (self::ENTREPOT_HOST === $host && str_starts_with($path, $datastorePath)) {
            $response = $this->datastoreResponse($method, substr($path, strlen($datastorePath)), (string) parse_url($url, PHP_URL_QUERY), $options);
            if ($response instanceof MockResponse) {
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
        foreach (self::$failures as $index => [$request, $passes]) {
            if ("$method $relative" !== $request) {
                continue;
            }
            if ($passes > 0) {
                self::$failures[$index][1] = $passes - 1;
                break;
            }
            array_splice(self::$failures, $index, 1);

            return $this->json(['error' => 'Internal Server Error', 'error_description' => "Échec simulé de $method $relative"], 500);
        }

        if ('GET' === $method && '' === $relative) {
            return $this->json(['_id' => self::DATASTORE_ID, 'name' => 'Entrepôt test', 'technical_name' => 'entrepot_test', 'community' => ['_id' => 'community-1'], 'endpoints' => [
                ['endpoint' => ['_id' => self::METADATA_ENDPOINT_ID, 'type' => 'METADATA', 'open' => true, 'urls' => [['type' => 'CSW', 'url' => 'https://csw.test/csw']]]],
                ['endpoint' => ['_id' => self::WFS_PUBLIC_ENDPOINT_ID, 'technical_name' => 'wfs-public', 'type' => 'WFS', 'open' => true, 'urls' => [['type' => 'WFS', 'url' => 'https://wfs.test/public']]]],
                ['endpoint' => ['_id' => self::WFS_PRIVATE_ENDPOINT_ID, 'technical_name' => 'wfs-private', 'type' => 'WFS', 'open' => false, 'urls' => [['type' => 'WFS', 'url' => 'https://wfs.test/private']]]],
                ['endpoint' => ['_id' => self::WMSV_PUBLIC_ENDPOINT_ID, 'technical_name' => 'wmsv-public', 'type' => 'WMS-VECTOR', 'open' => true, 'urls' => [['type' => 'WMS', 'url' => 'https://wms.test/public']]]],
                ['endpoint' => ['_id' => self::WMSR_PUBLIC_ENDPOINT_ID, 'technical_name' => 'wmsr-public', 'type' => 'WMS-RASTER', 'open' => true, 'urls' => [['type' => 'WMS', 'url' => 'https://wms-r.test/public']]]],
            ]]);
        }

        parse_str($queryString, $query);

        if ('GET' === $method && 1 === preg_match('#^(processings/executions|offerings|configurations|metadata|statics|annexes|stored_data|uploads|permissions)$#', $relative)) {
            $items = array_values(array_filter(self::$store[$relative] ?? [], fn (array $item) => $this->matches($item, $query)));

            return $this->json($items, 200, ['content-range' => sprintf('0-%d/%d', max(count($items) - 1, 0), count($items))]);
        }

        if ('GET' === $method && 1 === preg_match('#^(processings/executions|stored_data|uploads|configurations|offerings)/([\w-]+)$#', $relative, $matches)) {
            $item = $this->find($matches[1], $matches[2]);

            return null === $item ? $this->json(['error' => 'NotFound'], 404) : $this->json($item);
        }

        if ('GET' === $method && 1 === preg_match('#^configurations/([\w-]+)/offerings$#', $relative, $matches)) {
            $items = array_values(array_filter(self::$store['offerings'] ?? [], fn (array $item) => ($item['configuration']['_id'] ?? null) === $matches[1]));

            return $this->json($items, 200, ['content-range' => sprintf('0-%d/%d', max(count($items) - 1, 0), count($items))]);
        }

        // vérifications d’une livraison : clé « checks » de l’entité semée
        if ('GET' === $method && 1 === preg_match('#^uploads/([\w-]+)/checks$#', $relative, $matches)) {
            return $this->json(($this->find('uploads', $matches[1])['checks'] ?? []) + ['asked' => [], 'in_progress' => [], 'passed' => [], 'failed' => []]);
        }

        if ('GET' === $method && 1 === preg_match('#^uploads/[\w-]+/tree$#', $relative)) {
            return $this->json([]);
        }

        if ('DELETE' === $method && 1 === preg_match('#^uploads/([\w-]+)/tags$#', $relative, $matches)) {
            self::$writeRequests[] = ['method' => $method, 'path' => '/api/datastores/'.self::DATASTORE_ID.$path, 'body' => ''];
            $this->update('uploads', $matches[1], fn (array $item) => ['tags' => array_diff_key($item['tags'], array_flip(explode(',', is_string($query['tags'] ?? null) ? $query['tags'] : '')))] + $item);

            return new MockResponse('', ['http_code' => 204]);
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
            self::$writeRequests[] = ['method' => $method, 'path' => '/api/datastores/'.self::DATASTORE_ID.$path, 'body' => $body];

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

        if ('POST' === $method && 1 === preg_match('#^(metadata|uploads|stored_data|configurations)/([\w-]+)/tags$#', $relative, $matches)) {
            return $this->json($this->update($matches[1], $matches[2], fn (array $item) => ['tags' => [...$item['tags'], ...json_decode($body, true, flags: JSON_THROW_ON_ERROR)]] + $item));
        }

        // comme l’Entrepôt (vérifié le 10/11/2026) : la création ignore `extra`, seul un PATCH l’écrit en remplaçant l’objet entier
        if ('POST' === $method && 'configurations' === $relative) {
            $request = json_decode($body, true, flags: JSON_THROW_ON_ERROR);
            unset($request['extra']);
            $configuration = ['_id' => 'configuration-'.self::$nextId++, 'status' => 'UNPUBLISHED', 'tags' => [], ...$request];
            self::$store['configurations'][] = $configuration;

            return $this->json($configuration, 201);
        }

        if ('PATCH' === $method && 1 === preg_match('#^configurations/([\w-]+)$#', $relative, $matches)) {
            return $this->json($this->update('configurations', $matches[1], fn (array $item) => json_decode($body, true, flags: JSON_THROW_ON_ERROR) + $item));
        }

        if ('POST' === $method && 1 === preg_match('#^configurations/([\w-]+)/offerings$#', $relative, $matches)) {
            $request = json_decode($body, true, flags: JSON_THROW_ON_ERROR);
            $configuration = $this->find('configurations', $matches[1]) ?? [];
            $offering = [
                '_id' => 'offering-'.self::$nextId++,
                'type' => $configuration['type'] ?? null,
                'layer_name' => $configuration['layer_name'] ?? null,
                'open' => $request['open'],
                'status' => 'PUBLISHING',
                'endpoint' => ['_id' => $request['endpoint']],
                'configuration' => ['_id' => $matches[1]],
                'urls' => [['type' => 'WFS', 'url' => 'https://wfs.test/'.($request['open'] ? 'public' : 'private')]],
            ];
            self::$store['offerings'][] = $offering;

            return $this->json($offering, 201);
        }

        // POST /permissions renvoie la liste des permissions créées, une par communauté (vérifié le 10/11/2026)
        if ('POST' === $method && 'permissions' === $relative) {
            $request = json_decode($body, true, flags: JSON_THROW_ON_ERROR);
            $created = array_values(array_map(fn (string $communityId) => [
                '_id' => 'permission-'.self::$nextId++,
                'licence' => $request['licence'],
                'offerings' => array_map(fn (string $id) => ['_id' => $id], $request['offerings']),
                'beneficiary' => ['_id' => $communityId],
            ], $request['communities']));
            self::$store['permissions'] = [...(self::$store['permissions'] ?? []), ...$created];

            return $this->json($created);
        }

        if ('POST' === $method && 'uploads' === $relative) {
            $upload = ['_id' => 'upload-'.self::$nextId++, 'status' => 'OPEN', 'tags' => [], ...json_decode($body, true, flags: JSON_THROW_ON_ERROR)];
            self::$store['uploads'][] = $upload;

            return $this->json($upload, 201);
        }

        // fichiers d’une livraison puis fermeture : les vérifications démarrent
        if ('POST' === $method && 1 === preg_match('#^uploads/([\w-]+)/(data|md5|close)$#', $relative, $matches)) {
            if ('close' === $matches[2]) {
                $this->update('uploads', $matches[1], fn (array $item) => ['status' => 'CHECKING'] + $item);
            }

            return new MockResponse('', ['http_code' => 204]);
        }

        if ('POST' === $method && 'processings/executions' === $relative) {
            $storedData = ['_id' => 'stored-data-'.self::$nextId++, 'status' => 'CREATED', 'tags' => []];
            $execution = ['_id' => 'execution-'.self::$nextId++, 'status' => 'CREATED', 'output' => ['stored_data' => $storedData]];
            self::$store['stored_data'][] = $storedData;
            self::$store['processings/executions'][] = $execution;

            return $this->json($execution, 201);
        }

        if ('POST' === $method && 1 === preg_match('#^processings/executions/([\w-]+)/launch$#', $relative, $matches)) {
            $this->update('processings/executions', $matches[1], fn (array $item) => ['status' => 'WAITING'] + $item);

            return new MockResponse('', ['http_code' => 204]);
        }

        if ('POST' === $method && 1 === preg_match('#^metadata/(publication|unpublication)$#', $relative, $matches)) {
            $request = json_decode($body, true, flags: JSON_THROW_ON_ERROR);
            foreach (self::$store['metadata'] ?? [] as $index => $item) {
                if (in_array($item['file_identifier'] ?? null, $request['file_identifiers'], true)) {
                    self::$store['metadata'][$index]['endpoints'] = 'publication' === $matches[1] ? [['_id' => $request['endpoint']]] : [];
                }
            }

            return new MockResponse('', ['http_code' => 204]);
        }

        if ('POST' === $method && 'annexes' === $relative) {
            preg_match('#name="paths"\r\n\r\n([^\r]*)#', $body, $matches);
            $annexe = ['_id' => 'annexe-'.self::$nextId++, 'paths' => explode(',', $matches[1] ?? ''), 'labels' => []];
            self::$store['annexes'][] = $annexe;

            return $this->json($annexe, 201);
        }

        if ('POST' === $method && 'statics' === $relative) {
            preg_match('#name="name"\r\n\r\n([^\r]*)#', $body, $matches);
            $static = ['_id' => 'static-'.self::$nextId++, 'name' => $matches[1] ?? null];
            self::$store['statics'][] = $static;

            return $this->json($static, 201);
        }

        if ('PATCH' === $method && 1 === preg_match('#^(annexes|statics|stored_data)/([\w-]+)$#', $relative, $matches)) {
            return $this->json($this->update($matches[1], $matches[2], fn (array $item) => json_decode($body, true, flags: JSON_THROW_ON_ERROR) + $item));
        }

        // une exécution non lancée emporte sa donnée stockée de sortie
        if ('DELETE' === $method && 1 === preg_match('#^processings/executions/([\w-]+)$#', $relative, $matches)) {
            $outputId = $this->find('processings/executions', $matches[1])['output']['stored_data']['_id'] ?? null;
            self::$store['processings/executions'] = array_values(array_filter(self::$store['processings/executions'] ?? [], fn (array $item) => $item['_id'] !== $matches[1]));
            self::$store['stored_data'] = array_values(array_filter(self::$store['stored_data'] ?? [], fn (array $item) => $item['_id'] !== $outputId));

            return new MockResponse('', ['http_code' => 204]);
        }

        if ('DELETE' === $method && 1 === preg_match('#^(annexes|statics|metadata|uploads|stored_data|configurations|permissions)/([\w-]+)$#', $relative, $matches)) {
            self::$store[$matches[1]] = array_values(array_filter(self::$store[$matches[1]] ?? [], fn (array $item) => $item['_id'] !== $matches[2]));

            return new MockResponse('', ['http_code' => 204]);
        }

        return null;
    }

    // filtres de liste de l’Entrepôt : tags[clé]=valeur, labels[]=clé=valeur, path
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

        if (isset($query['path']) && !in_array($query['path'], $item['paths'] ?? [], true)) {
            return false;
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
