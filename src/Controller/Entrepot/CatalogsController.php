<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\CatalogsApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/catalogs',
    name: 'cartesgouvfr_api_catalogs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[entrepot] catalogs')]
class CatalogsController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private CatalogsApiService $catalogsApiService,
    ) {
    }

    #[Route('/communities', name: 'communities', methods: ['GET'])]
    public function communities(): JsonResponse
    {
        try {
            $response = $this->catalogsApiService->getAllCommunities();

            return $this->json($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/organizations', name: 'organizations', methods: ['GET'])]
    public function organizations(): JsonResponse
    {
        try {
            $organizations = $this->catalogsApiService->getAllOrganizations();

            return $this->json($organizations);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
