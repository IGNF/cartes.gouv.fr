<?php

namespace App\Controller\Api;

use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastore',
    name: 'cartesgouvfr_api_datastore_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class DatastoreController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/{datastoreId}', name: 'get', methods: ['GET'])]
    public function getDatastore(string $datastoreId): JsonResponse
    {
        return $this->json($this->entrepotApiService->datastore->get($datastoreId));
    }

    #[Route('/{datastoreId}/endpoints', name: 'get_endpoints', methods: ['GET'])]
    public function getEndpoints(
        string $datastoreId,
        #[MapQueryParameter] string $type = null,
        #[MapQueryParameter] bool $open = null
    ): JsonResponse {
        $endpoints = $this->entrepotApiService->datastore->getEndpoints($datastoreId, [
            'type' => $type,
            'open' => $open,
        ]);

        return $this->json($endpoints);
    }
}
