<?php

namespace App\Controller\Api;

use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\CartesServiceApi;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
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
        private EntrepotApiService $entrepotApiService,
        private CartesServiceApi $cartesServiceApi,
    ) {
    }

    #[Route('', name: 'get_offerings_list', methods: ['GET'])]
    public function getOfferings(string $datastoreId, #[MapQueryParameter] bool $detailed = false): JsonResponse
    {
        try {
            if (true === $detailed) {
                $offerings = $this->entrepotApiService->configuration->getAllOfferingsDetailed($datastoreId);
            } else {
                $offerings = $this->entrepotApiService->configuration->getAllOfferings($datastoreId);
            }

            return $this->json($offerings);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'get_service', methods: ['GET'])]
    public function getService(string $datastoreId, string $offeringId): JsonResponse
    {
        try {
            $offering = $this->cartesServiceApi->getService($datastoreId, $offeringId);

            return $this->json($offering);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'unpublish_service', methods: ['DELETE'])]
    public function unpublishService(string $datastoreId, string $offeringId): Response
    {
        try {
            $this->cartesServiceApi->unpublish($datastoreId, $offeringId);

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    protected function getEndpointByShareType(string $datastoreId, string $configType, string $shareWith): array
    {
        // TODO : implémentation partielle, tous les partages ne sont pas couverts
        if ('all_public' === $shareWith) {
            $endpoints = $this->entrepotApiService->datastore->getEndpointsList($datastoreId, [
                'type' => $configType,
                'open' => true,
            ]);
        } elseif ('your_community' === $shareWith) {
            $endpoints = $this->entrepotApiService->datastore->getEndpointsList($datastoreId, [
                'type' => $configType,
                'open' => false,
            ]);
        } else {
            throw new CartesApiException('Valeur du champ [share_with] est invalide', Response::HTTP_BAD_REQUEST, ['share_with' => $shareWith]);
        }

        if (0 === count($endpoints)) {
            throw new CartesApiException("Aucun point d'accès (endpoint) du datastore ne peut convenir à la demande", Response::HTTP_BAD_REQUEST, ['share_with' => $shareWith]);
        }

        return $endpoints[0]['endpoint'];
    }
}
