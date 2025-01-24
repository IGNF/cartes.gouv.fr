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
    '/api/espaceco/databases/{databaseId}',
    name: 'cartesgouvfr_api_espaceco_databases',
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
     * @param array<string> $fields
     */
    #[Route('/table/{tableId}', name: 'get_table', methods: ['GET'])]
    public function getTable(
        int $databaseId,
        int $tableId,
        #[MapQueryParameter] ?array $fields = [],
    ): JsonResponse {
        try {
            $table = $this->databaseApiService->getTable($databaseId, $tableId, $fields);

            // return new JsonResponse($featureTypes);
            return new JsonResponse();
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
