<?php

namespace App\Services;

use App\Exception\CartesApiException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class GeonetworkApiService
{
    private HttpClientInterface $geonetworkClient;

    public function __construct(
        ParameterBagInterface $parameterBag,
        HttpClientInterface $httpClient,
    ) {
        $this->geonetworkClient = $httpClient->withOptions([
            'base_uri' => $parameterBag->get('geonetwork_url').'/',
            'proxy' => $parameterBag->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    public function getMetadataXml(string $fileIdentifier): string
    {
        $url = "geonetwork/srv/api/records/$fileIdentifier/formatters/xml";
        $response = $this->geonetworkClient->request('GET', $url);

        return $this->handleResponse($response);
    }

    protected function handleResponse(ResponseInterface $response): mixed
    {
        $statusCode = $response->getStatusCode();
        if (200 == $statusCode) { // requête réussie
            return $response->getContent();
        }

        throw new CartesApiException('Erreur dans la récupération des metadadonnées sur Geonetwork', $statusCode);
    }
}
