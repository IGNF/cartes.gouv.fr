<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Services\EspaceCoApi\UserApiService;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

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
}