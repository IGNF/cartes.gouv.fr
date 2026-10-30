<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Services\EntrepotApi\CatalogsApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/catalogs',
    name: 'cartesgouvfr_api_catalogs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[entrepot] catalogs')]
class CatalogsController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly CatalogsApiService $catalogsApiService,
    ) {
    }

    #[Route('/communities', name: 'communities', methods: ['GET'])]
    public function communities(): JsonResponse
    {
        $response = $this->catalogsApiService->getAllCommunities()->resolve();

        return $this->json($response);
    }

    #[Route('/organizations', name: 'organizations', methods: ['GET'])]
    public function organizations(): JsonResponse
    {
        $organizations = $this->catalogsApiService->getAllOrganizations()->resolve();

        return $this->json($organizations);
    }
}
