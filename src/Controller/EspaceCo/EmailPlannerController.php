<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Services\EspaceCoApi\EmailPlannerApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/emailplanner',
    name: 'cartesgouvfr_api_espaceco_emailplanner_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] email-planner', description: "Planification d'emails d'une communauté")]
class EmailPlannerController extends AbstractController implements ApiControllerInterface
{
    public const SEARCH_LIMIT = 20;

    public function __construct(
        private readonly EmailPlannerApiService $emailPlannerApiService,
    ) {
    }

    #[Route('/{communityId}', name: 'get', methods: ['GET'])]
    public function get(int $communityId): JsonResponse
    {
        $response = $this->emailPlannerApiService->getAll($communityId)->resolve();

        return new JsonResponse($response);
    }

    #[Route('/{communityId}', name: 'add', methods: ['POST'])]
    public function add(int $communityId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $response = $this->emailPlannerApiService->add($communityId, $data)->array();

        return new JsonResponse($response);
    }

    #[Route('/{communityId}/update/{emailPlannerId}', name: 'update', methods: ['PUT'])]
    public function update(int $communityId, int $emailPlannerId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $response = $this->emailPlannerApiService->update($communityId, $emailPlannerId, $data)->array();

        return new JsonResponse($response);
    }

    #[Route('/{communityId}/remove/{emailPlannerId}', name: 'remove', methods: ['DELETE'])]
    public function removeEmailPlanners(int $communityId, int $emailPlannerId): JsonResponse
    {
        $this->emailPlannerApiService->remove($communityId, $emailPlannerId)->await();

        return new JsonResponse(['emailplanner_id' => $emailPlannerId]);
    }
}
