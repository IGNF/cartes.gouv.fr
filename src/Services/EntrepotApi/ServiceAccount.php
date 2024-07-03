<?php

namespace App\Services\EntrepotApi;

use App\Exception\ApiException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpClient\Exception\JsonException;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class ServiceAccount
{
    /** @var HttpClientInterface */
    private $apiClient;

    /** @var array<mixed> */
    private $me;

    /** @var array<mixed> */
    private $token;

    /** @var string */
    private $sandBoxCommunityId;

    public function __construct(
        private ParameterBagInterface $parameters,
        private UserApiService $userApiService,
    ) {
        // L'id de la community liee au datastore "Bac à sable"
        $sandbox = $this->parameters->get('sandbox');
        if ($sandbox && isset($sandbox['community_id'])) {
            $this->sandBoxCommunityId = $sandbox['community_id'];
        }

        $this->apiClient = HttpClient::createForBaseUri($this->parameters->get('api_entrepot_url').'/', [
            'proxy' => $this->parameters->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);

        $this->me = $this->userApiService->getMe();

        // Recuperation du token du compte de service
        $this->token = $this->getAccessToken();
    }

    public function getSandboxCommunity(): ?array
    {
        if (!$this->token) {
            return null;
        }

        if (!$this->sandBoxCommunityId) {
            return null;
        }

        $options = $this->prepareOptions();

        try {
            $response = $this->apiClient->request('GET', "communities/{$this->sandBoxCommunityId}", $options);
            $sandboxCommunity = $this->handleResponse($response);

            $sandboxDatastoreId = $sandboxCommunity['datastore']['_id'];
            $response = $this->apiClient->request('GET', "datastores/$sandboxDatastoreId", $options);
            $sandboxDatastore = $this->handleResponse($response);

            return [
                'community' => $sandboxCommunity,
                'datastore' => $sandboxDatastore,
            ];
        } catch (ApiException $e) {
            return null;
        }
    }

    /**
     * Ajout de l'utilisateur courant (logge) a la communaute liee au datastore "Bac à sable".
     */
    public function addCurrentUserToSandbox(): void
    {
        if (!$this->token) {
            throw new AccessDeniedException();
        }

        $alreadyMember = false;
        foreach ($this->me['communities_member'] as $member) {
            if ($this->sandBoxCommunityId == $member['community']['_id']) {
                $alreadyMember = true;
                break;
            }
        }

        if ($alreadyMember) {
            return;
        }

        $options = $this->prepareOptions([
            'rights' => ['ANNEX', 'BROADCAST', 'PROCESSING', 'UPLOAD'],
        ]);

        $response = $this->apiClient->request('PUT', "communities/{$this->sandBoxCommunityId}/users/{$this->me['_id']}", $options);
        $this->handleResponse($response);
    }

    /**
     * Recuperation du Token.
     */
    private function getAccessToken(): ?array
    {
        $uri = $this->parameters->get('iam_url').'/realms/'.$this->parameters->get('iam_realm').'/protocol/openid-connect/';

        $client = HttpClient::createForBaseUri($uri, [
            'proxy' => $this->parameters->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);

        $body = [
            'grant_type' => 'client_credentials',
            'client_id' => $this->parameters->get('sandbox_service_account')['client_id'],
            'client_secret' => $this->parameters->get('sandbox_service_account')['client_secret'],
        ];

        $response = $client->request('POST', 'token', [
            'body' => $body,
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Accept' => 'application/json',
            ],
        ]);

        if (Response::HTTP_OK !== $response->getStatusCode()) {
            return null;
        }

        return \json_decode($response->getContent(), true);
    }

    /**
     * Undocumented function.
     *
     * @param array<mixed> $body
     * @param array<mixed> $query
     * @param array<mixed> $headers
     */
    private function prepareOptions($body = [], $query = [], $headers = []): array
    {
        $defaultHeaders = [
            'Content-Type' => 'application/json',
        ];

        $options = [
            'json' => $body,
            'headers' => array_merge($defaultHeaders, $headers),
        ];

        $options['headers']['Authorization'] = "Bearer {$this->token['access_token']}";
        $options['query'] = $query;

        return $options;
    }

    private function handleResponse(ResponseInterface $response): mixed
    {
        $content = null;

        $statusCode = $response->getStatusCode();
        if ($statusCode >= 200 && $statusCode < 300) { // if request is successful
            if (204 == $statusCode || '' == $response->getContent()) { // if response body is empty
                $content = [];
            } else {
                $content = $response->toArray();
            }

            return $content;
        }

        $errorMsg = 'Entrepot API Error';
        try {
            $errorResponse = $response->toArray(false);
            if (array_key_exists('error_description', $errorResponse)) {
                $errorMsg = is_array($errorResponse['error_description']) ? implode(', ', $errorResponse['error_description']) : $errorResponse['error_description'];
            }
        } catch (JsonException $ex) {
            $errorResponse = $response->getContent(false);
        }

        throw new ApiException($errorMsg, $statusCode, $errorResponse);
    }
}
