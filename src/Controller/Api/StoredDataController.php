<?php

namespace App\Controller\Api;

use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/stored_data',
    name: 'cartesgouvfr_api_stored_data_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class StoredDataController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/{storedDataId}', name: 'get_one')]
    public function getStoredData(string $datastoreId, string $storedDataId): JsonResponse
    {
        return $this->json($this->entrepotApiService->storedData->get($datastoreId, $storedDataId));
    }
}
