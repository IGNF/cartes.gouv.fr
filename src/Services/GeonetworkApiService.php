<?php

namespace App\Services;

use App\Exception\CartesApiException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpClient\HttpOptions;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class GeonetworkApiService
{
    private HttpClientInterface $geonetworkClient;
    private string $baseUrl;

    public function __construct(
        ParameterBagInterface $parameterBag,
        HttpClientInterface $httpClient,
    ) {
        $parsedUrl = parse_url($parameterBag->get('api_entrepot_url'));
        $this->baseUrl = sprintf('%s://%s', $parsedUrl['scheme'], $parsedUrl['host']);

        $this->geonetworkClient = $httpClient->withOptions(
            (new HttpOptions())
                ->setBaseUri($this->baseUrl)
                ->setProxy($parameterBag->get('http_proxy'))
                ->verifyHost(false)
                ->verifyPeer(false)
                ->toArray()
        );
    }

    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    public function getUrl(string $fileIdentifier): string
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

        // NOTE : si le fileIdentifier commence par "sandbox", on considère que la requête doit être redirigée vers l'instance sandbox de geonetwork, qui est séparée de l'instance de production et a une URL différente
        // strtolower pour éviter les problèmes de casse dans le fileIdentifier. Jusqu'à présent côté backend on le mettait en minuscule. Mais désormais ça sera la valeur telle qu'elle est fournie par l'API. Donc il y aura un mélange de majuscules et minuscules
        if (str_starts_with(strtolower($fileIdentifier), 'sandbox')) {
            $url = '/sandbox/csw';
        }

        $url .= '?'.http_build_query($query);

        return $url;
    }

    public function getMetadataXml(string $fileIdentifier): string
    {
        $url = $this->getUrl($fileIdentifier);

        $response = $this->geonetworkClient->request('GET', $url);

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
