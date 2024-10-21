<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Services\EspaceCoApi\UserApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/espaceco/user',
    name: 'cartesgouvfr_api_espaceco_user_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class UserController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private UserApiService $userApiService,
    ) {
    }

    #[Route('/me', name: 'me')]
    public function getCurrentUser(): JsonResponse
    {
        $me = $this->userApiService->getMe();

        return $this->json($me);
    }

    #[Route('/search', name: 'search')]
    public function search(
        #[MapQueryParameter] string $search
    ): JsonResponse {
        $users = $this->userApiService->search($search);

        return new JsonResponse($users);
    }

    #[Route('/me/shared_themes', name: 'shared_themes')]
    public function getSharedThemes(): JsonResponse
    {
        $me = $this->userApiService->getSharedThemes();

        return $this->json($me);
    }
}
