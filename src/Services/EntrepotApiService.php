<?php

namespace App\Services;

use App\Security\KeycloakToken;
use League\OAuth2\Client\Token\AccessToken;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class EntrepotApiService
{
    private RequestStack $requestStack;
    private HttpClientInterface $apiClient;

    public function __construct(ParameterBagInterface $params, RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;

        $this->apiClient = HttpClient::createForBaseUri($params->get('api_plage_url'), [
            'proxy' => $params->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    /**
     * @return array<mixed>
     */
    public function getUserMe(): array
    {
        $options = [
            'headers' => [
                // 'Accept' => 'application/json',
                // 'Content-Type' => 'application/json',
                'Authorization' => "Bearer {$this->getToken()}",
            ],
        ];

        $response = $this->apiClient->request('GET', 'users/me', $options);

        return $response->toArray(false);
    }

    private function getToken(): string
    {
        /** @var SessionInterface */
        $session = $this->requestStack->getSession();

        /** @var AccessToken */
        $accessToken = $session->get(KeycloakToken::SESSION_KEY);

        return $accessToken->getToken();
    }
}
