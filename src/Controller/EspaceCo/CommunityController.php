<?php

namespace App\Controller\EspaceCo;

use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Controller\ApiControllerInterface;
use Symfony\Component\Routing\Attribute\Route;
use App\Services\EspaceCoApi\CommunityApiService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route(
    '/api/espaceco/community',
    name: 'cartesgouvfr_api_espaceco_community_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class CommunityController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private CommunityApiService $communityApiService,
    ) {
    }

    #[Route('/get', name: 'get', methods: ['GET'])]
    public function get(
        #[MapQueryParameter] ?int $page = 1,
        #[MapQueryParameter] ?int $limit = 10
    ): JsonResponse
    {
        try {
            $response = $this->communityApiService->get($page, $limit);
            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
