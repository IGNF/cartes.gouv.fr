<?php

namespace App\Services\EntrepotApi;

use App\Exception\AppException;
use App\Exception\EntrepotApiException;
use App\Security\KeycloakToken;
use App\Services\EntrepotApiService;
use League\OAuth2\Client\Token\AccessToken;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpClient\Exception\JsonException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

abstract class AbstractEntrepotApiService
{
    private HttpClientInterface $apiClient;
    private RequestStack $requestStack;
    private LoggerInterface $logger;

    protected EntrepotApiService $entrepotApiService;

    public function __construct(HttpClientInterface $httpClient, ParameterBagInterface $params, RequestStack $requestStack, LoggerInterface $logger)
    {
        $this->requestStack = $requestStack;
        $this->logger = $logger;

        $this->apiClient = $httpClient->withOptions([
            'base_uri' => $params->get('api_plage_url'),
            'proxy' => $params->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    public function setEntrepotApiService(EntrepotApiService $entrepotApiService): self
    {
        $this->entrepotApiService = $entrepotApiService;

        return $this;
    }

    protected function postFile(): mixed
    {
        throw new AppException('TODO: not yet implemented');
    }

    protected function requestAll(): mixed
    {
        throw new AppException('TODO: not yet implemented');
    }

    /**
     * Undocumented function.
     *
     * @param array<mixed> $body
     * @param array<mixed> $query
     * @param array<mixed> $headers
     *
     * @SuppressWarnings(BooleanArgumentFlag)
     */
    protected function request(string $method, string $url, array $body = [], array $query = [], array $headers = [], bool $fileUpload = false, bool $expectJson = true, bool $includeHeaders = false): mixed
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
                // si on attend une réponse au format JSON ou pas
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
     * @param array<mixed> $body
     * @param array<mixed> $query
     * @param array<mixed> $headers
     *
     * @return array<mixed>
     *
     * @SuppressWarnings(BooleanArgumentFlag)
     * @SuppressWarnings(ElseExpression)
     */
    protected function prepareOptions(array $body = [], array $query = [], array $headers = [], bool $fileUpload = false): array
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
