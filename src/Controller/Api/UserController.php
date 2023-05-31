<?php

namespace App\Controller\Api;

use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

// TODO: , condition: 'request.isXmlHttpRequest()'
#[Route('/api/user', name: 'cartesgouvfr_api_user_', options: ['expose' => true])]
class UserController extends AbstractController
{
    public function __construct(
        private readonly EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/me', name: 'me')]
    public function getCurrentUser(): JsonResponse
    {
        return $this->json($this->getUser());
    }

    #[Route('/me/datastores', name: 'datastores_list')]
    public function getUserDatastores(): JsonResponse
    {
        // TODO: recherche de bac à sable et autres entrepots
        return $this->json($this->entrepotApiService->user->getMyDatastores());
    }
}
