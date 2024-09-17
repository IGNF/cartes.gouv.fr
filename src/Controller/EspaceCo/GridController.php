<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\GridApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/grid',
    name: 'cartesgouvfr_api_espaceco_grid_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class GridController extends AbstractController implements ApiControllerInterface
{
    public const SEARCH_LIMIT = 20;

    public function __construct(
        private GridApiService $gridApiService
    ) {
    }

    #[Route('/search', name: 'search', methods: ['GET'])]
    public function get(
        #[MapQueryParameter] string $text,
        #[MapQueryParameter] ?string $searchBy,
        #[MapQueryParameter] ?string $fields,
        #[MapQueryParameter] ?string $adm,
        #[MapQueryParameter] ?int $page = 1,
        #[MapQueryParameter] ?int $limit = self::SEARCH_LIMIT,
    ): JsonResponse {
        try {
            $response = $this->gridApiService->getGrids($text, $searchBy, $fields, $adm, $page, $limit);

            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}