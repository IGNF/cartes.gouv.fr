<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/offerings',
    name: 'cartesgouvfr_api_service_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class ServiceController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('', name: 'get_offerings', methods: ['GET'])]
    public function getOfferings(string $datastoreId): JsonResponse
    {
        try {
            $offerings = $this->entrepotApiService->configuration->getAllOfferings($datastoreId);

            return $this->json($offerings);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'get_offering', methods: ['GET'])]
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

    #[Route('/{offeringId}', name: 'wfs_unpublish', methods: ['DELETE'])]
    public function unpublish(string $datastoreId, string $offeringId): Response
    {
        try {
            $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
            $offering['configuration'] = $this->entrepotApiService->configuration->get($datastoreId, $offering['configuration']['_id']);

            $this->entrepotApiService->configuration->removeOffering($datastoreId, $offering['_id']);
            $configurationId = $offering['configuration']['_id'];

            // la suppression de l'offering nécessite quelques instants, et tant que la suppression de l'offering n'est pas faite, on ne peut pas demander la suppression de la configuration
            while (1) {
                sleep(3);
                $configuration = $this->entrepotApiService->configuration->get($datastoreId, $configurationId);
                if (ConfigurationStatuses::UNPUBLISHED === $configuration['status']) {
                    break;
                }
            }
            $this->entrepotApiService->configuration->remove($datastoreId, $configurationId);

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
