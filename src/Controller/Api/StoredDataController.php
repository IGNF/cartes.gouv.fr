<?php

namespace App\Controller\Api;

use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
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

    #[Route('/{storedDataId}', name: 'get', methods: ['GET'])]
    public function getStoredData(string $datastoreId, string $storedDataId): JsonResponse
    {
        try {
            $storedData = $this->entrepotApiService->storedData->get($datastoreId, $storedDataId);

            return $this->json($storedData);
        } catch (EntrepotApiException $ex) {
            if (Response::HTTP_NOT_FOUND === $ex->getStatusCode()) {
                throw new CartesApiException("La donnée stockée [$storedDataId] n'existe pas", $ex->getStatusCode(), $ex->getDetails());
            } elseif (Response::HTTP_BAD_REQUEST === $ex->getStatusCode()) {
                throw new CartesApiException("L'identifiant de la donnée stockée [$storedDataId] est invalide", $ex->getStatusCode(), $ex->getDetails());
            }
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }
}
