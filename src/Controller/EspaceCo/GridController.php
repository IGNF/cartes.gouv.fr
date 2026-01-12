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
    '/api/espaceco/grids',
    name: 'cartesgouvfr_api_espaceco_grids_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] grids', description: 'Emprises (entités administratives et autres)')]
class GridController extends AbstractController implements ApiControllerInterface
{
    public const SEARCH_LIMIT = 10;

    public function __construct(
        private GridApiService $gridApiService,
    ) {
    }

    #[Route('/', name: 'get_all', methods: ['GET'])]
    public function getAll(
        #[MapQueryParameter] string $text,
        #[MapQueryParameter] ?string $searchBy,
        #[MapQueryParameter] ?string $fields,
        #[MapQueryParameter] ?string $adm,
        #[MapQueryParameter] ?int $page = 1,
        #[MapQueryParameter] ?int $limit = self::SEARCH_LIMIT,
    ): JsonResponse {
        try {
            $response = $this->gridApiService->getAll($text, $searchBy, $fields, $adm, $page, $limit);

            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<string> $fields
     */
    #[Route('/{name}', name: 'get', methods: ['GET'])]
    public function get(string $name, #[MapQueryParameter] ?array $fields = []): JsonResponse
    {
        try {
            $response = $this->gridApiService->get($name, $fields ?? []);

            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
