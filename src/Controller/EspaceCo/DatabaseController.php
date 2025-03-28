<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\DatabaseApiService;
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
class DatabaseController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private DatabaseApiService $databaseApiService,
    ) {
    }

    /**
     * @param array<string> $dbIds
     */
    #[Route('/', name: 'get', methods: ['GET'])]
    public function get(#[MapQueryParameter] array $dbIds = []): JsonResponse
    {
        try {
            $dbs = $this->databaseApiService->getAll($dbIds, ['id']);

            $databases = [];
            foreach ($dbs as $db) {
                $database = $this->databaseApiService->getDatabase($db['id'], ['id', 'name', 'title', 'tables']);
                foreach ($database['tables'] as &$t) {
                    $t = $this->databaseApiService->getTable($database['id'], $t['id'], ['id', 'name', 'title', 'columns']);
                    $t['columns'] = array_map(fn ($column) => ['id' => $column['id'], 'name' => $column['name'], 'title' => $column['title']], $t['columns']);
                }
                $databases[] = $database;

                /* $tables = $this->databaseApiService->getAllTables($database['id'], ['id', 'name', 'title', 'geometry_name']);
                foreach ($tables as &$table) {
                    $t = $this->databaseApiService->getTable($database['id'], $table['id'], ['id', 'name', 'title', 'columns']);
                    $table['columns'] = array_map(fn ($column) => ['id' => $column['id'], 'name' => $column['name'], 'title' => $column['title']], $t['columns']);
                }
                $database['tables'] = $tables;
                $databases[] = $database; */
            }

            return new JsonResponse($databases);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
