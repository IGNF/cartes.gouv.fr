<?php

namespace App\Controller\Entrepot;

use App\Services\CswMetadataHelper;
use App\Exception\CartesApiException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

#[Route(
    '/geonetwork/metadata',
    name: 'cartesgouvfr_geonetwork_metadata_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class GeonetworkController extends AbstractController
{
    private HttpClientInterface $geonetworkClient;

    public function __construct(
        ParameterBagInterface $parameterBag,
        HttpClientInterface $httpClient,
        private CswMetadataHelper $cswMetadataHelper
    ) {
        $this->geonetworkClient = $httpClient->withOptions([
            'base_uri' => $parameterBag->get('geonetwork_url').'/',
            'proxy' => $parameterBag->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    #[Route('/get_infos/{fileIdentifier}', name: 'get_infos', methods: ['GET'])]
    public function getInfos(string $fileIdentifier) : JsonResponse
    {
        $url = "geonetwork/srv/api/records/$fileIdentifier/formatters/xml";
        $response = $this->geonetworkClient->request('GET', $url);
        
        $metadatas = $this->handleResponse($response);
        $cswMetadata = $this->cswMetadataHelper->fromXml($metadatas);

        $privateLayers = [];
        foreach($cswMetadata->layers as $layer) {
            $parts = parse_url($layer->endpointUrl);
            if (preg_match('/private/', $parts['path'])) {
                $privateLayers[] = $layer;   
            }
        }

        return new JsonResponse([
            'contact_email' => $cswMetadata->contactEmail,
            'private_layers' => $privateLayers
        ]);
    }

    /**
     * @SuppressWarnings(ElseExpression)
     */
    protected function handleResponse(ResponseInterface $response): mixed
    {
        $statusCode = $response->getStatusCode();
        if ($statusCode == 200) { // requête réussie
            return $response->getContent();
        }

        throw new CartesApiException("Erreur dans la récupération des metadadonnées sur Geonetwork", $statusCode);
    }
}