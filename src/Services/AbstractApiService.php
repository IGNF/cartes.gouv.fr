<?php

namespace App\Services;

use App\Security\KeycloakToken;
use League\OAuth2\Client\Token\AccessToken;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

abstract class AbstractApiService
{
    private HttpClientInterface $apiClient;

    public function __construct(
        HttpClientInterface $httpClient,
        protected ParameterBagInterface $parameters,
        protected Filesystem $filesystem,
        private RequestStack $requestStack,
        private LoggerInterface $logger,
        string $api,
    ) {
        $this->apiClient = $httpClient->withOptions([
            'base_uri' => $parameters->get($api).'/',
            'proxy' => $parameters->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    /**
     * @param array<mixed> $formFields correspond à "Request Body" dans le swagger
     * @param array<mixed> $query      correspond aux paramètes "Query" dans le swagger
     */
    protected function sendFile(string $method, string $url, string $filepath, array $formFields = [], array $query = [], string $fileFieldName = 'file'): array
    {
        $formFields[$fileFieldName] = DataPart::fromPath($filepath); // ajout du fichier dans $formFields
        $formData = new FormDataPart($formFields);

        $body = $formData->bodyToIterable();
        $headers = $formData->getPreparedHeaders()->toArray();

        return $this->request($method, $url, $body, $query, $headers, true);
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

        if (isset($response['headers']['content-range'][0])) {
            $contentRange = $response['headers']['content-range'][0];
            $pageCount = $this->getResultsPageCount($contentRange, $query['limit']);

            // on a déjà le contenu de la page 1, donc on commence à 2 et on va jusqu'à $pageCount
            for ($i = 2; $i <= $pageCount; ++$i) {
                $query['page'] = $i;
                $allResources = array_merge($allResources, $this->request('GET', $url, [], $query, $headers));
            }
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

        $responseInfo = $response->getInfo();
        $finalUrl = array_key_exists('url', $responseInfo) ? $responseInfo['url'] : null;

        $this->logger->debug(self::class, [$method, $url, $body, $query, $response->getContent(false), $finalUrl]);

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
    abstract protected function handleResponse(ResponseInterface $response, bool $expectJson): mixed;

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
