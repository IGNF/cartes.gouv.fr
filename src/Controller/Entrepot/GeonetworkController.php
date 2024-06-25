<?php

namespace App\Controller\Entrepot;

use App\Services\CswMetadataHelper;
use App\Services\GeonetworkApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/geonetwork/metadata',
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

    #[Route('/get_infos/{fileIdentifier}', name: 'get_infos', methods: ['GET'])]
    public function getInfos(string $fileIdentifier): JsonResponse
    {
        $xml = $this->geonetworkApiService->getMetadataXml($fileIdentifier);
        $cswMetadata = $this->cswMetadataHelper->fromXml($xml);

        $privateLayers = [];
        foreach ($cswMetadata->layers as $layer) {
            $parts = parse_url($layer->endpointUrl);
            if (preg_match('/private/', $parts['path'])) {
                $privateLayers[] = $layer;
            }
        }

        return new JsonResponse([
            'contact_email' => $cswMetadata->contactEmail,
            'private_layers' => $privateLayers,
        ]);
    }
}
