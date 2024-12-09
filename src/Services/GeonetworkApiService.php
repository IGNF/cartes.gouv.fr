<?php

namespace App\Services;

use App\Exception\CartesApiException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpClient\HttpOptions;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

/**
 * // NOTE : ne pas utiliser car la variable d'environnement `geonetwork_url` a été supprimée, parce qu'en production la route `geonetwork/srv/api/records/$fileIdentifier/formatters/xml` n'est pas disponible.
 */
class GeonetworkApiService
{
    private HttpClientInterface $geonetworkClient;

    public function __construct(
        ParameterBagInterface $parameterBag,
        HttpClientInterface $httpClient,
    ) {
        $parsedUrl = parse_url($parameterBag->get('api_entrepot_url'));
        $baseUrl = sprintf('%s://%s', $parsedUrl['scheme'], $parsedUrl['host']);

        $this->geonetworkClient = $httpClient->withOptions(
            (new HttpOptions())
                ->setBaseUri($baseUrl)
                ->setProxy($parameterBag->get('http_proxy'))
                ->verifyHost(false)
                ->verifyPeer(false)
                ->toArray()
        );
    }

    public function getMetadataXml(string $fileIdentifier): string
    {
        $query = [
            'REQUEST' => 'GetRecordById',
            'SERVICE' => 'CSW',
            'VERSION' => '2.0.2',
            'OUTPUTSCHEMA' => 'http://www.isotc211.org/2005/gmd',
            'elementSetName' => 'full',
            'ID' => $fileIdentifier,
        ];

        // $url = "geonetwork/srv/api/records/$fileIdentifier/formatters/xml";
        $url = '/csw';
        if (str_starts_with($fileIdentifier, 'sandbox')) {
            $url = '/sandbox/csw';
        }

        $response = $this->geonetworkClient->request('GET', $url, ['query' => $query]);

        return $this->handleResponse($response);
    }

    protected function handleResponse(ResponseInterface $response): mixed
    {
        $statusCode = $response->getStatusCode();
        if (200 === $statusCode) { // requête réussie
            return $response->getContent();
        }

        throw new CartesApiException('Erreur dans la récupération des metadadonnées sur Geonetwork', $statusCode);
    }
}
