<?php

namespace App\Services\EntrepotApi;

use App\Exception\EntrepotApiException;
use App\Security\KeycloakToken;
use App\Services\EntrepotApiService;
use League\OAuth2\Client\Token\AccessToken;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpClient\Exception\JsonException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

abstract class AbstractEntrepotApiService
{
    protected EntrepotApiService $entrepotApiService;
    private HttpClientInterface $apiClient;

    public function __construct(
        HttpClientInterface $httpClient,
        protected ParameterBagInterface $parameters,
        protected Filesystem $filesystem,
        private RequestStack $requestStack,
        private LoggerInterface $logger
    ) {
        $this->apiClient = $httpClient->withOptions([
            'base_uri' => $parameters->get('api_plage_url'),
            'proxy' => $parameters->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    public function setEntrepotApiService(EntrepotApiService $entrepotApiService): self
    {
        $this->entrepotApiService = $entrepotApiService;

        return $this;
    }

    /**
     * @param array<mixed> $query
     */
    protected function postFile(string $url, string $filepath, array $query = []): array
    {
        $formFields = [
            'filename' => DataPart::fromPath($filepath),
        ];
        $formData = new FormDataPart($formFields);

        $body = $formData->bodyToIterable();
        $headers = $formData->getPreparedHeaders()->toArray();

        return $this->request('POST', $url, $body, $query, $headers, true);
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
        $query['limit'] = 50;

        $response = $this->request('GET', $url, [], $query, $headers, false, true, true);

        $allResources = $response['content'];

        $contentRange = $response['headers']['content-range'][0];
        $pageCount = $this->getResultsPageCount($contentRange, $query['limit']);

        // on a déjà le contenu de la page 1, donc on commence à 2 et on va jusqu'à $pageCount
        for ($i = 2; $i <= $pageCount; ++$i) {
            $query['page'] = $i;
            $allResources = array_merge($allResources, $this->request('GET', $url, [], $query, $headers));
        }

        return $allResources;
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
        $options = $this->prepareOptions($body, $query, $headers, $fileUpload);

        $response = $this->apiClient->request($method, $url, $options);

        $this->logger->debug(self::class, [$method, $url, $body, $query, $response->getContent(false)]);

        $responseContent = $this->handleResponse($response, $expectJson);

        if ($includeHeaders) {
            return [
                'content' => $responseContent,
                'headers' => $response->getHeaders(),
            ];
        }

        return $responseContent;
    }

    /**
     * @SuppressWarnings(ElseExpression)
     */
    protected function handleResponse(ResponseInterface $response, bool $expectJson): mixed
    {
        $content = null;
        $statusCode = $response->getStatusCode();

        if ($statusCode >= 200 && $statusCode < 300) { // requête réussie
            if (Response::HTTP_NO_CONTENT === $statusCode || '' === $response->getContent()) {
                $content = [];
            } else {
                // si on attend une réponse au format JSON
                $content = $expectJson ? $response->toArray() : $response->getContent();
            }

            return $content;
        } else {
            $errorMsg = 'Entrepot API Error';
            try {
                $errorResponse = $response->toArray(false);
                if (array_key_exists('error_description', $errorResponse)) {
                    $errorMsg = $errorResponse['error_description'];
                }
            } catch (JsonException $ex) {
                $errorResponse = $response->getContent(false);
            }
            throw new EntrepotApiException($errorMsg, $statusCode, $errorResponse);
        }
    }

    /**
     * @param iterable<mixed> $body
     * @param array<mixed>    $query
     * @param array<mixed>    $headers
     *
     * @return array<mixed>
     *
     * @SuppressWarnings(BooleanArgumentFlag)
     * @SuppressWarnings(ElseExpression)
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
            ];
        } else {
            $options = [
                'json' => $body,
                'headers' => array_merge($defaultHeaders, $headers),
            ];
        }

        /** @var AccessToken */
        $accessToken = $this->getKeycloakToken();

        $options['headers']['Authorization'] = "Bearer {$accessToken->getToken()}";
        $options['query'] = $query;

        return $options;
    }

    private function getKeycloakToken(): AccessToken
    {
        /** @var SessionInterface */
        $session = $this->requestStack->getSession();

        /** @var AccessToken */
        $accessToken = $session->get(KeycloakToken::SESSION_KEY);

        return $accessToken;
    }
}
