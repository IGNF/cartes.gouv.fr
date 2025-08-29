<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\DatabaseApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/databases',
    name: 'cartesgouvfr_api_espaceco_databases_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] database', description: 'Bases de données')]
class DatabaseController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private DatabaseApiService $databaseApiService,
    ) {
    }

    /**
     * @param array<string> $fields
     */
    #[Route('/', name: 'get_all', requirements: ['communityId' => '\d+'], methods: ['GET'])]
    public function getAll(#[MapQueryParameter] array $fields = []): JsonResponse
    {
        try {
            $databases = $this->databaseApiService->getAll($fields);

            return new JsonResponse($databases);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<string> $fields
     */
    #[Route('/{databaseId}', name: 'get', requirements: ['databaseId' => '\d+'], methods: ['GET'])]
    public function get(
        int $databaseId,
        #[MapQueryParameter] array $fields = []): JsonResponse
    {
        try {
            $database = $this->databaseApiService->getDatabase($databaseId, $fields);

            return new JsonResponse($database);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<string> $fields
     */
    #[Route('/search_by', name: 'search_by', methods: ['GET'])]
    public function searchBy(
        #[MapQueryParameter] string $field,
        #[MapQueryParameter] string $value,
        #[MapQueryParameter] string $sort,
        #[MapQueryParameter] array $fields = []): JsonResponse
    {
        try {
            $databases = $this->databaseApiService->searchBy($field, $value, $sort, $fields);

            return new JsonResponse($databases);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<string> $fields
     */
    #[Route('/{databaseId}/tables/{tableId}', name: 'get_table', requirements: ['databaseId' => '\d+', 'tableId' => '\d+'], methods: ['GET'])]
    public function getTable(
        int $databaseId,
        int $tableId,
        #[MapQueryParameter] array $fields = []): JsonResponse
    {
        try {
            $table = $this->databaseApiService->getTable($databaseId, $tableId, $fields);

            return new JsonResponse($table);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
