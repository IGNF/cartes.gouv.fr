<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\WfsApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/wfs',
    name: 'cartesgouvfr_api_espaceco_wfs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] wfs', description: 'WFS')]
class WfsController extends AbstractController implements ApiControllerInterface
{
    #[Route('/{databaseName}', name: 'request', methods: ['GET'])]
    public function request(Request $request, WfsApiService $wfsApiService, ?string $databaseName = null): Response
    {
        try {
            $wfs = $wfsApiService->wfsRequest($request->query->all(), $databaseName);

            $contentType = str_starts_with($wfs, '<?xml') ? 'application/xml' : 'application/json';

            return new Response($wfs, Response::HTTP_OK, [
                'Content-Type' => $contentType,
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
