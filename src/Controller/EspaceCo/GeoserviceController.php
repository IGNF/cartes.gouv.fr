<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\GeoserviceApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/geoservice',
    name: 'cartesgouvfr_api_espaceco_geoservice_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] geoservice', description: 'Service de données géographiques')]
class GeoserviceController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private GeoserviceApiService $geoserviceApiService,
    ) {
    }

    /**
     * @param array<string> $fields
     */
    #[Route('/get/{geoserviceId}', name: 'get', methods: ['GET'])]
    public function get(
        int $geoserviceId,
        #[MapQueryParameter] ?array $fields = [],
    ): JsonResponse {
        try {
            $geoservice = $this->geoserviceApiService->getGeoservice($geoserviceId, $fields);

            return new JsonResponse($geoservice);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
