<?php

namespace App\Controller\Entrepot;

use App\Services\CswMetadataHelper;
use App\Services\GeonetworkApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/geonetwork/metadata',
    name: 'cartesgouvfr_geonetwork_metadata_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class GeonetworkController extends AbstractController
{
    public function __construct(
        private CswMetadataHelper $cswMetadataHelper,
        private GeonetworkApiService $geonetworkApiService,
    ) {
    }

    #[Route('/{fileIdentifier}', name: 'get', methods: ['GET'])]
    public function get(string $fileIdentifier): JsonResponse
    {
        // https://data.geopf.fr/csw
        $xml = $this->geonetworkApiService->getMetadataXml($fileIdentifier);

        // supprime la balise csw:GetRecordByIdResponse
        $xml = explode("\n", $xml);
        $xml = array_filter($xml, fn ($l) => !str_contains($l, 'csw:GetRecordByIdResponse'));
        $xml = implode("\n", $xml);

        $cswMetadata = $this->cswMetadataHelper->fromXml($xml);

        $privateLayers = array_filter($cswMetadata->layers, function ($layer) {
            $parts = parse_url($layer->gmdOnlineResourceUrl);

            return preg_match('/private/', $parts['path']);
        });
        $privateLayers = array_values($privateLayers);

        return new JsonResponse([
            'contact_email' => $cswMetadata->contactEmail,
            'private_layers' => $privateLayers,
        ]);
    }
}
