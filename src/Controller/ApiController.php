<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

// , condition: 'request.isXmlHttpRequest()'
#[Route('/api', name: 'api_', options: ['expose' => true])]
class ApiController extends AbstractController
{
    #[Route('/test', name: 'test')]
    public function test(): JsonResponse
    {
        return $this->json(['status' => 'success']);
    }

    #[Route('/users/me', name: 'users_me')]
    public function getUsersMe(): JsonResponse
    {
        return $this->json($this->getUser());
    }
}
