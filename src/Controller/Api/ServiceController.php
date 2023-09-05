<?php

namespace App\Controller\Api;

use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}',
    name: 'cartesgouvfr_api_service_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class ServiceController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/offerings', name: 'get_offerings', methods: ['GET'])]
    public function getOfferings(string $datastoreId): JsonResponse
    {
        try {
            $offerings = $this->entrepotApiService->configuration->getAllOfferings($datastoreId);
            return $this->json($offerings);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/offering/{offeringId}', name: 'get_offering', methods: ['GET'])]
    public function getOffering(string $datastoreId, string $offeringId): JsonResponse
    {
        try {
            $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
            $offering['configuration'] = $this->entrepotApiService->configuration->get($datastoreId, $offering['configuration']['_id']);

            return $this->json($offering);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
