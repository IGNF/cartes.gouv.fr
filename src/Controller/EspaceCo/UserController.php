<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Services\EspaceCoApi\UserApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/user',
    name: 'cartesgouvfr_api_espaceco_user_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] user', description: "Informations des utilisateurs de l'espaceco")]
class UserController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly UserApiService $userApiService,
    ) {
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function getMe(): JsonResponse
    {
        $me = $this->userApiService->getMe()->array();

        return $this->json($me);
    }

    #[Route('/search', name: 'search', methods: ['GET'])]
    public function search(
        #[MapQueryParameter] string $search,
    ): JsonResponse {
        $users = $this->userApiService->search($search)->array();

        return new JsonResponse($users);
    }

    #[Route('/me/shared_themes', name: 'shared_themes', methods: ['GET'])]
    public function getSharedThemes(): JsonResponse
    {
        $me = $this->userApiService->getSharedThemes();

        return $this->json($me);
    }
}
