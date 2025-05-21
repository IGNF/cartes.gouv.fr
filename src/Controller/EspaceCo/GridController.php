<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\GridApiService;
use OpenApi\Attributes as OA;
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
#[OA\Tag(name: '[espaceco] grids', description: 'Emprises (entités administratives et autres)')]
class GridController extends AbstractController implements ApiControllerInterface
{
    public const SEARCH_LIMIT = 20;

    public function __construct(
        private GridApiService $gridApiService,
    ) {
    }

    /**
     * @param array<string> $names
     */
    #[Route('/get_by_names', name: 'get_by_names', methods: ['GET'])]
    public function getFromArray(
        #[MapQueryParameter] array $names,
    ): JsonResponse {
        try {
            if (0 == count($names)) {
                throw new ApiException('names is not an array or is empty');
            }

            $response = $this->gridApiService->getGridsFromNames($names);

            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
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
