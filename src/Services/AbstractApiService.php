<?php

namespace App\Services;

use App\Exception\ApiException;
use App\Security\KeycloakTokenManager;
use League\OAuth2\Client\Token\AccessToken;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Component\Security\Core\Exception\AuthenticationExpiredException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

abstract class AbstractApiService
{
    private HttpClientInterface $apiClient;

    private const FILE_UPLOAD_IDLE_TIMEOUT_SECONDS = 1200;
    private const FILE_UPLOAD_MAX_DURATION_SECONDS = 7200;

    public function __construct(
        HttpClientInterface $httpClient,
        protected ParameterBagInterface $parameters,
        protected Filesystem $filesystem,
        private KeycloakTokenManager $tokenManager,
        private LoggerInterface $logger,
        string $api,
    ) {
        $this->apiClient = $httpClient->withOptions([
            'base_uri' => $parameters->get($api).'/',
            'proxy' => $parameters->get('http_proxy'),
            'no_proxy' => $parameters->get('no_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    /**
     * @param array<string,string> $filepaths  (k: nom du champ, v: chemin vers le fichier)
     * @param array<mixed>         $formFields correspond à "Request Body" dans le swagger
     * @param array<mixed>         $query      correspond aux paramètes "Query" dans le swagger
     */
    protected function sendFiles(string $method, string $url, array $filepaths, array $formFields = [], array $query = []): array
    {
        foreach ($filepaths as $fileFieldName => $filepath) {
            $formFields[$fileFieldName] = DataPart::fromPath($filepath); // ajout du fichier dans $formFields
        }

        $formData = new FormDataPart($formFields);

        $body = $formData->bodyToIterable();
        $headers = $formData->getPreparedHeaders()->toArray();

        return $this->request($method, $url, $body, $query, $headers, true);
    }

    /**
     * @param array<mixed> $formFields correspond à "Request Body" dans le swagger
     * @param array<mixed> $query      correspond aux paramètes "Query" dans le swagger
     */
    protected function sendFile(string $method, string $url, string $filepath, array $formFields = [], array $query = [], string $fileFieldName = 'file'): array
    {
        return $this->sendFiles($method, $url, [$fileFieldName => $filepath], $formFields, $query);
    }

    /**
     * Calcule et retourne le nombre de pages à partir du header Content-Range.
     */
    protected function getResultsPageCount(string $contentRange, int $limit): int
    {
        $contentRangeArr = explode('/', $contentRange);
        $total = $contentRangeArr[1];

        return intval(ceil(intval($total) / $limit));
    }

    /**
     * Récupère toutes les ressources en faisant la requête GET en boucle (en utilisant le header content-range).
     *
     * @param array<mixed> $query
     * @param array<mixed> $headers
     *
     * @return array<mixed>
     */
    protected function requestAll(string $url, array $query = [], array $headers = []): array
    {
        $query['page'] = 1;
        $query['limit'] = 100;

        $firstPageResponse = $this->request('GET', $url, [], $query, $headers, false, true, true);
        $allResources = $firstPageResponse['content'];

        if (!isset($firstPageResponse['headers']['content-range'][0])) {
            return $allResources;
        }

        $contentRange = $firstPageResponse['headers']['content-range'][0];
        $pageCount = $this->getResultsPageCount($contentRange, $query['limit']);

        if ($pageCount <= 1) {
            return $allResources;
        }

        $responsesByPage = [];

        // La page 1 est déjà récupérée, on lance les pages restantes en parallèle.
        for ($i = 2; $i <= $pageCount; ++$i) {
            $pageQuery = $query;
            $pageQuery['page'] = $i;

            $responsesByPage[$i] = $this->requestAsync('GET', $url, [], $pageQuery, $headers);
        }

        /** @var array<int,array<mixed>> $resourcesByPage */
        $resourcesByPage = $this->handleAsyncResponses($responsesByPage);
        foreach ($resourcesByPage as $resources) {
            $allResources = array_merge($allResources, $resources);
        }

        return $allResources;
    }

    /**
     * @param iterable<mixed> $body
     * @param array<mixed>    $query
     * @param array<mixed>    $headers
     */
    protected function requestAsync(string $method, string $url, iterable $body = [], array $query = [], array $headers = [], bool $fileUpload = false): ResponseInterface
    {
        $options = $this->prepareOptions($body, $query, $headers, $fileUpload);

        return $this->apiClient->request($method, $url, $options);
    }

    /**
     * Fonction générique qui sert à appeler l'API. On s'attend à ce que l'API retourne un string JSON ou un corps vide dans la plupart du temps, sauf dans certains cas connus comme pour les fichiers de logs, alors l'API doit retourner du texte simple. Déclenche une exception en cas de "Bad Request", avec le détail de l'erreur retournée par l'API.
     *
     * @param iterable<mixed> $body
     * @param array<mixed>    $query
     * @param array<mixed>    $headers
     *
     * @SuppressWarnings(BooleanArgumentFlag)
     */
    protected function request(string $method, string $url, iterable $body = [], array $query = [], array $headers = [], bool $fileUpload = false, bool $expectJson = true, bool $includeHeaders = false): mixed
    {
        try {
            $response = $this->requestAsync($method, $url, $body, $query, $headers, $fileUpload);
            $responseContent = $this->handleResponse($response, $expectJson);
        } catch (TransportExceptionInterface $exception) {
            throw $this->createTransportException($method, $url, $query, $exception);
        }

        if ($includeHeaders) {
            return [
                'content' => $responseContent,
                'headers' => $response->getHeaders(),
            ];
        }

        return $responseContent;
    }

    protected function handleResponse(ResponseInterface $response, bool $expectJson): mixed
    {
        $statusCode = $response->getStatusCode();

        if ($statusCode >= 200 && $statusCode < 300) {
            return $this->handleSuccessResponse($response, $expectJson);
        }

        $errorResponse = $this->extractErrorResponse($response);
        $errorMessage = $this->extractErrorMessage($errorResponse, $response);

        throw $this->createApiException($errorMessage, $statusCode, $errorResponse);
    }

    protected function handleSuccessResponse(ResponseInterface $response, bool $expectJson): mixed
    {
        $statusCode = $response->getStatusCode();

        if (Response::HTTP_NO_CONTENT === $statusCode || '' === $response->getContent()) {
            return [];
        }

        return $expectJson ? $response->toArray() : $response->getContent();
    }

    abstract protected function extractErrorResponse(ResponseInterface $response): mixed;

    abstract protected function extractErrorMessage(mixed $errorResponse, ResponseInterface $response): string;

    abstract protected function createApiException(string $message, int $statusCode, mixed $details = []): ApiException;

    /**
     * @param array<int|string,ResponseInterface> $responsesByKey
     *
     * @return array<mixed>
     */
    protected function handleAsyncResponses(array $responsesByKey, bool $expectJson = true, bool $continueOnError = false): array
    {
        if ([] === $responsesByKey) {
            return [];
        }

        $resolved = [];
        $responseKeyMap = [];
        $responseList = [];

        foreach ($responsesByKey as $key => $response) {
            $responseList[] = $response;
            $responseKeyMap[spl_object_id($response)] = $key;
        }

        foreach ($this->apiClient->stream($responseList) as $response => $chunk) {
            $responseId = spl_object_id($response);
            $key = $responseKeyMap[$responseId] ?? null;

            if ($chunk->isTimeout()) {
                $exception = new ApiException('Timeout de stream lors de la résolution asynchrone', Response::HTTP_SERVICE_UNAVAILABLE, [
                    'key' => $key,
                ]);

                if (!$continueOnError) {
                    throw $exception;
                }

                $this->logger->warning('Timeout de stream détecté lors de la résolution asynchrone', [
                    'key' => $key,
                ]);

                continue;
            }

            if (!$chunk->isLast()) {
                continue;
            }

            if (!isset($responseKeyMap[$responseId])) {
                continue;
            }

            try {
                $resolved[$key] = $this->handleResponse($response, $expectJson);
            } catch (\Throwable $exception) {
                if (!$continueOnError) {
                    throw $exception;
                }

                $this->logger->warning('Requête asynchrone ignorée après échec', [
                    'key' => $key,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        ksort($resolved);

        return $resolved;
    }

    /**
     * @param array<mixed>                                 $items
     * @param callable(mixed,int|string):ResponseInterface $asyncFetcher
     *
     * @return array<mixed>
     */
    protected function fetchAllDetailsAsync(array $items, callable $asyncFetcher, bool $continueOnError = false): array
    {
        if ([] === $items) {
            return [];
        }

        $responsesByKey = [];

        foreach ($items as $key => $item) {
            $responsesByKey[$key] = $asyncFetcher($item, $key);
        }

        $resolved = $this->handleAsyncResponses($responsesByKey, true, $continueOnError);
        foreach ($resolved as $key => $payload) {
            $items[$key] = $payload;
        }

        return $items;
    }

    /**
     * @param iterable<mixed> $body
     * @param array<mixed>    $query
     * @param array<mixed>    $headers
     *
     * @return array<mixed>
     *
     * @SuppressWarnings(BooleanArgumentFlag)
     */
    protected function prepareOptions(iterable $body = [], array $query = [], array $headers = [], bool $fileUpload = false): array
    {
        $defaultHeaders = [
            'Content-Type' => 'application/json',
            // "Accept" => "application/json",
        ];

        $options = [];
        if ($fileUpload) {
            $options = [
                'body' => $body,
                'headers' => $headers,
                'timeout' => self::FILE_UPLOAD_IDLE_TIMEOUT_SECONDS,
                'max_duration' => self::FILE_UPLOAD_MAX_DURATION_SECONDS,
                'extra' => [
                    // Avoid dev/profiler issues with streamed bodies (Callable/iterable) and large payloads.
                    'trace_content' => false,
                ],
            ];
        } else {
            $options = [
                'headers' => array_merge($defaultHeaders, $headers),
            ];
            if (!empty($body)) {
                $options['json'] = $body;
            }
        }

        /** @var AccessToken */
        $accessToken = $this->getKeycloakToken();

        $options['headers']['Authorization'] = "Bearer {$accessToken->getToken()}";
        $options['query'] = $query;

        return $options;
    }

    private function getKeycloakToken(): AccessToken
    {
        return $this->tokenManager->getToken() ?? throw new AuthenticationExpiredException();
    }

    /**
     * @param array<mixed> $query
     */
    private function createTransportException(string $method, string $url, array $query, TransportExceptionInterface $exception): ApiException
    {
        $message = sprintf('Erreur réseau lors de l\'appel API %s %s: %s', $method, $url, $exception->getMessage());

        return new ApiException($message, Response::HTTP_SERVICE_UNAVAILABLE, [
            'method' => $method,
            'url' => $url,
            'query' => $query,
        ], $exception);
    }
}
