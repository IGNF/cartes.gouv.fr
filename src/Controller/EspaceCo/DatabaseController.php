<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\DatabaseApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
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

    #[Route('/', name: 'get_all', methods: ['GET'])]
    public function getAll(): JsonResponse
    {
        try {
            $dbs = $this->databaseApiService->getAll(['id']);

            $databases = [];
            foreach ($dbs as $db) {
                $database = $this->databaseApiService->getDatabase($db['id'], ['id', 'name', 'title']);
                $tables = $this->databaseApiService->getAllTables($database['id'], ['id', 'name', 'title', 'geometry_name']);
                foreach ($tables as &$table) {
                    $t = $this->databaseApiService->getTable($database['id'], $table['id'], ['id', 'name', 'title', 'columns']);
                    $table['columns'] = array_map(fn ($column) => ['id' => $column['id'], 'name' => $column['name'], 'title' => $column['title']], $t['columns']);
                }
                $database['tables'] = $tables;
                $databases[] = $database;
            }

            return new JsonResponse($databases);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
