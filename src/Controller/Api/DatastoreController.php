<?php

namespace App\Controller\Api;

use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
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

    #[Route('/{datastoreId}', name: 'get')]
    public function getDatastore(string $datastoreId): JsonResponse
    {
        return $this->json($this->entrepotApiService->datastore->get($datastoreId));
    }
}
