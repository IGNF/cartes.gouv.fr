<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use Symfony\Component\Routing\Attribute\Route;
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
    #[Route('/get', name: 'get', methods: ['GET'],
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()')]
    public function get(
        #[MapQueryParameter] ?int $page = 1,
        #[MapQueryParameter] ?int $limit = 10
    ): JsonResponse
    {
        /* try {

            return new JsonResponse($community);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } */
        return new JsonResponse();
    }
}
