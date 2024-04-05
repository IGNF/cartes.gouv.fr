<?php

namespace App\Services;

use App\Services\EntrepotApiService;
use App\Exception\EntrepotApiException;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpClient\Exception\JsonException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class ServiceAccount
{
    /** @var HttpClientInterface */
    private $apiClient;

    /** @var array<mixed> */
    private $me;

    /** @var array<mixed> */
    private $token = null;

    /** @var string */
    private $sandBoxCommunityId;

    public function __construct(
        private EntrepotApiService $entrepotApiService,
        private ParameterBagInterface $parameters
    )
    {      
        // L'id de la community liee au datastore "Bac à sable"
        $this->sandBoxCommunityId = $this->parameters->get('sandbox_community_id');

        $this->apiClient = HttpClient::createForBaseUri($this->parameters->get('api_entrepot_url'), [
            'proxy' => $this->parameters->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,    
        ]);

        $this->me = $this->entrepotApiService->user->getMe();

        // Recuperation du token du compte de service
        $this->token = $this->getAccessToken();
    }

    public function getSandboxCommunity() : array | null
    {
        if (! $this->token) {
            return null;
        }

        // Id de la community "Bac à sable"
        $sandboxId = $this->parameters->get('sandbox_community_id');
        if (! $sandboxId) {
            return null;
        }

        $options = $this->prepareOptions();

        try {
            $response = $this->apiClient->request('GET', "communities/$sandboxId", $options);
            $sandboxCommunity = $this->handleResponse($response);

            $sandboxDatastoreId = $sandboxCommunity['datastore']['_id'];
            $response = $this->apiClient->request('GET', "datastores/$sandboxDatastoreId", $options);
            $sandboxDatastore = $this->handleResponse($response);

            return [
                'community' => $sandboxCommunity,
                'datastore' => $sandboxDatastore
            ];
        } catch(EntrepotApiException $e) {
            return null;
        }
    }

    public function getSandboxDatastore() : array
    {
        // Id de la community "Bac à sable"
        $sandboxId = $this->parameters->get('sandbox_community_id');
        if (! $sandboxId) {
            throw new EntrepotApiException('sandbox community does not exist', JsonResponse::HTTP_NOT_FOUND);
        }

        $options = $this->prepareOptions();

        $response = $this->apiClient->request('GET', "communities/$sandboxId", $options);
        return $this->handleResponse($response);
    }

    /**
     * Ajout de l'utilisateur courant (logge) a la communaute liee au datastore "Bac à sable"
     */
    public function addCurrentUserToSandbox() : void
    {
        if (!$this->token) {
            throw new AccessDeniedException();
        }
        
        $alreadyMember = false;
        foreach($this->me['communities_member'] as $member) {
            if ($this->sandBoxCommunityId == $member['community']['_id']) {
                $alreadyMember = true;
                break;    
            }
        }

        if ($alreadyMember) return;

        $options = $this->prepareOptions([
            'rights' => ['ANNEX', 'BROADCAST', 'PROCESSING', 'UPLOAD'],    
        ]);

        $response = $this->apiClient->request('PUT', "communities/{$this->sandBoxCommunityId}/users/{$this->me['_id']}", $options);
        $this->handleResponse($response);
    }

    /**
     * Recuperation du Token.
     */
    private function getAccessToken(): Array | null
    {
        $uri = $this->parameters->get('iam_url').'/realms/'.$this->parameters->get('iam_realm').'/protocol/openid-connect/';

        $client = HttpClient::createForBaseUri($uri, [
            'proxy' => $this->parameters->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
        
        $body = [
            'grant_type' => 'client_credentials',
            'client_id' => $this->parameters->get('service_account')['client_id'],
            'client_secret' => $this->parameters->get('service_account')['client_secret']
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
     * Undocumented function
     *
     * @param array<mixed> $body
     * @param array<mixed> $query
     * @param array<mixed> $headers
     * @return Array
     */
    private function prepareOptions($body = [], $query = [], $headers = []): Array
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

        throw new EntrepotApiException($errorMsg, $statusCode, $errorResponse);
    }
}