<?php

namespace App\Controller\Entrepot;

use App\Services\CswMetadataHelper;
use App\Services\GeonetworkApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/geonetwork/metadata',
    name: 'cartesgouvfr_geonetwork_metadata_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[cartes.gouv.fr] geonetwork', description: 'Les métadonnées sur geonetwork')]
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

        if ($this->isNotFound($xml)) {
            return new JsonResponse([
                'code' => Response::HTTP_NOT_FOUND,
                'status' => 'Not Found',
                'message' => sprintf('Aucune métadonnée trouvée avec le file_identifier "%s"', $fileIdentifier),
                'details' => [],
            ], Response::HTTP_NOT_FOUND);
        }

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

    public function isNotFound(string $xml): bool
    {
        $xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';

        $xml = str_replace(["\r", "\n", $xmlHeader], '', $xml);

        return empty($xml);
    }
}
