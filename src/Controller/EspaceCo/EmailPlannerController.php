<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\EmailPlannerApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/emailplanner',
    name: 'cartesgouvfr_api_espaceco_emailplanner_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class EmailPlannerController extends AbstractController implements ApiControllerInterface
{
    public const SEARCH_LIMIT = 20;

    public function __construct(
        private EmailPlannerApiService $emailPlannerApiService
    ) {
    }

    #[Route('/{communityId}', name: 'get', methods: ['GET'])]
    public function get(int $communityId): JsonResponse
    {
        try {
            $response = $this->emailPlannerApiService->getAll($communityId);

            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{communityId}/remove/{emailPlannerId}', name: 'remove', methods: ['DELETE'])]
    public function removeEmailPlanners(int $communityId, int $emailPlannerId): JsonResponse
    {
        try {
            $this->emailPlannerApiService->remove($communityId, $emailPlannerId);

            return new JsonResponse(['emailplanner_id' => $emailPlannerId]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
