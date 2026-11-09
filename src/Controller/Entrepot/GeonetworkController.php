<?php

namespace App\Controller\Entrepot;

use App\Exception\AppException;
use App\Exception\MissingCswMetadataException;
use App\Services\CswMetadataXmlReader;
use App\Services\GeonetworkApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/geonetwork/metadata',
    name: 'cartesgouvfr_api_geonetwork_metadata_',
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] geonetwork', description: 'Les métadonnées sur geonetwork')]
class GeonetworkController extends AbstractController
{
    public function __construct(
        private readonly CswMetadataXmlReader $cswMetadataReader,
        private readonly GeonetworkApiService $geonetworkApiService,
    ) {
    }

    #[Route('/{fileIdentifier}', name: 'get', methods: ['GET'])]
    public function get(string $fileIdentifier): JsonResponse
    {
        // https://data.geopf.fr/csw : réponse GetRecordById, enveloppe csw:GetRecordByIdResponse vide si inconnu
        $xml = $this->geonetworkApiService->getMetadataXml($fileIdentifier);

        try {
            $cswMetadata = $this->cswMetadataReader->read($xml);
        } catch (MissingCswMetadataException $e) {
            throw new AppException(sprintf('Aucune métadonnée trouvée avec le file_identifier "%s"', $fileIdentifier), Response::HTTP_NOT_FOUND, previous: $e);
        }

        return $this->json($cswMetadata);
    }
}
