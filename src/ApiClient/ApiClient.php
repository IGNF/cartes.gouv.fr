<?php

namespace App\ApiClient;

use App\ApiClient\ErrorParser\ErrorParserInterface;
use App\Exception\ApiException;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class ApiClient
{
    private const ASYNC_MAX_IN_FLIGHT = 20;
    private const FILE_UPLOAD_IDLE_TIMEOUT_SECONDS = 1200;
    private const FILE_UPLOAD_MAX_DURATION_SECONDS = 7200;

    public function __construct(
        private HttpClientInterface $httpClient,
        private ErrorParserInterface $errorParser,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * Envoie une requête et retourne un PendingResponse sans avoir consommé la réponse.
     */
    public function request(string $method, string $url, ?RequestOptions $options = null): PendingResponse
    {
        $options ??= new RequestOptions();
        $httpOptions = $this->buildHttpOptions($options);

        try {
            $response = $this->httpClient->request($method, $url, $httpOptions);
        } catch (TransportExceptionInterface $e) {
            throw new ApiException(sprintf('Erreur réseau lors de l\'appel API %s %s: %s', $method, $url, $e->getMessage()), Response::HTTP_SERVICE_UNAVAILABLE, ['method' => $method, 'url' => $url], $e);
        }

        return new PendingResponse($response, $this->errorParser);
    }

    /**
     * Raccourci pour les requêtes GET.
     *
     * @param array<string,mixed> $query
     */
    public function get(string $url, array $query = []): PendingResponse
    {
        return $this->request('GET', $url, [] !== $query ? RequestOptions::query($query) : null);
    }

    /**
     * Raccourci pour les requêtes POST avec un corps JSON.
     *
     * @param iterable<mixed>     $body
     * @param array<string,mixed> $query
     */
    public function post(string $url, iterable $body = [], array $query = []): PendingResponse
    {
        return $this->request('POST', $url, RequestOptions::json($body, $query));
    }

    /**
     * Raccourci pour les requêtes PUT avec un corps JSON.
     *
     * @param iterable<mixed>     $body
     * @param array<string,mixed> $query
     */
    public function put(string $url, iterable $body = [], array $query = []): PendingResponse
    {
        return $this->request('PUT', $url, RequestOptions::json($body, $query));
    }

    /**
     * Raccourci pour les requêtes PATCH avec un corps JSON.
     *
     * @param iterable<mixed>     $body
     * @param array<string,mixed> $query
     */
    public function patch(string $url, iterable $body = [], array $query = []): PendingResponse
    {
        return $this->request('PATCH', $url, RequestOptions::json($body, $query));
    }

    /**
     * Raccourci pour les requêtes DELETE.
     *
     * @param array<string,mixed> $query
     */
    public function delete(string $url, array $query = []): PendingResponse
    {
        return $this->request('DELETE', $url, [] !== $query ? RequestOptions::query($query) : null);
    }

    /**
     * Envoie un fichier via une requête multipart/form-data. Utile pour les endpoints d'upload de fichiers.
     *
     * @param array<string,mixed> $formFields
     * @param array<string,mixed> $query
     */
    public function sendFile(string $method, string $url, string $filepath, array $formFields = [], array $query = [], string $fieldName = 'file'): PendingResponse
    {
        return $this->sendFiles($method, $url, [$fieldName => $filepath], $formFields, $query);
    }

    /**
     * Envoie plusieurs fichiers via une requête multipart/form-data. Utile pour les endpoints d'upload de fichiers.
     *
     * @param array<string,string> $filepaths  (field name => file path)
     * @param array<string,mixed>  $formFields
     * @param array<string,mixed>  $query
     */
    public function sendFiles(string $method, string $url, array $filepaths, array $formFields = [], array $query = []): PendingResponse
    {
        foreach ($filepaths as $fieldName => $filepath) {
            $formFields[$fieldName] = DataPart::fromPath($filepath);
        }

        $formData = new FormDataPart($formFields);
        $options = RequestOptions::forFileUpload(
            $formData->bodyToIterable(),
            $formData->getPreparedHeaders()->toArray(),
            $query,
        );

        return $this->request($method, $url, $options);
    }

    /**
     * Récupère automatiquement toutes les pages d'un endpoint paginé GET.
     * Utilise des requêtes asynchrones parallèles pour les pages 2..N.
     *
     * @param array<string,mixed> $query
     * @param array<string,mixed> $headers
     *
     * @return array<mixed>
     */
    public function requestAll(string $url, array $query = [], array $headers = []): array
    {
        $query['page'] = 1;
        $query['limit'] = 100;

        $firstPage = $this->request('GET', $url, new RequestOptions(query: $query, headers: $headers))
            ->jsonWithHeaders();

        $allResources = $firstPage->content;

        $pageCount = $firstPage->getPageCount((int) $query['limit']);
        if (null === $pageCount) {
            return $allResources;
        }

        if ($pageCount <= 1) {
            return $allResources;
        }

        $pages = range(2, $pageCount);
        foreach (array_chunk($pages, self::ASYNC_MAX_IN_FLIGHT) as $pageChunk) {
            $pendingByPage = [];
            foreach ($pageChunk as $page) {
                $pageQuery = $query;
                $pageQuery['page'] = $page;
                $pendingByPage[$page] = $this->request('GET', $url, new RequestOptions(query: $pageQuery, headers: $headers));
            }

            $resourcesByPage = $this->resolveAll($pendingByPage);
            foreach ($resourcesByPage as $resources) {
                $allResources = array_merge($allResources, $resources);
            }
        }

        return $allResources;
    }

    /**
     * Consomme les réponses et retourne un tableau de résultats (clé => payload) ou lève une ApiException si l'une des réponses est une erreur.
     * Les erreurs sont ignorées si $continueOnError=true, auquel cas les réponses en erreur auront une valeur null dans le tableau de résultats.
     *
     * @param array<int|string, PendingResponse> $pendingsByKey
     *
     * @return array<int|string, array<mixed>>
     */
    public function resolveAll(array $pendingsByKey, bool $continueOnError = false): array
    {
        return PendingResponse::all($this->httpClient, $pendingsByKey, $continueOnError, $this->logger);
    }

    /**
     * Récupère les détails de chaque item d'une liste, en lots parallèles.
     *
     * @param array<mixed>                                 $items
     * @param callable(mixed, int|string): PendingResponse $asyncFetcher
     *
     * @return array<mixed>
     */
    public function fetchAllDetailsAsync(array $items, callable $asyncFetcher, bool $continueOnError = false): array
    {
        if ([] === $items) {
            return [];
        }

        $keys = array_keys($items);
        foreach (array_chunk($keys, self::ASYNC_MAX_IN_FLIGHT) as $keyChunk) {
            $pendingsByKey = [];
            foreach ($keyChunk as $key) {
                $pendingsByKey[$key] = $asyncFetcher($items[$key], $key);
            }

            $resolved = $this->resolveAll($pendingsByKey, $continueOnError);
            foreach ($resolved as $key => $payload) {
                $items[$key] = $payload;
            }
        }

        return $items;
    }

    /**
     * @return array<string, mixed>
     */
    private function buildHttpOptions(RequestOptions $options): array
    {
        if ($options->fileUpload) {
            return [
                'body' => $options->body,
                'headers' => $options->headers,
                'query' => $options->query,
                'timeout' => self::FILE_UPLOAD_IDLE_TIMEOUT_SECONDS,
                'max_duration' => self::FILE_UPLOAD_MAX_DURATION_SECONDS,
                'extra' => [
                    // Avoid dev/profiler issues with streamed bodies (Callable/iterable) and large payloads.
                    'trace_content' => false,
                ],
            ];
        }

        $httpOptions = [
            'headers' => array_merge(['Content-Type' => 'application/json'], $options->headers),
            'query' => $options->query,
        ];

        if (!empty($options->body)) {
            $httpOptions['json'] = $options->body;
        }

        return $httpOptions;
    }
}
