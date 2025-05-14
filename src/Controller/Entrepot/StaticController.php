<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\StaticApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/statics',
    name: 'cartesgouvfr_api_statics_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[entrepot] statics')]
class StaticController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private StaticApiService $staticApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getStaticsList(
        string $datastoreId,
    ): JsonResponse {
        try {
            $staticsList = $this->staticApiService->getAll($datastoreId);

            return $this->json($staticsList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{staticFileId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $staticFileId): JsonResponse
    {
        try {
            $this->staticApiService->delete($datastoreId, $staticFileId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
