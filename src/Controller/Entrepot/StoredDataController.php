<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Controller\Traits\PaginatedHeadersTrait;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Services\EntrepotApi\CartesDataDetailsService;
use App\Services\EntrepotApi\CartesStoredDataApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route(
    '/api/datastores/{datastoreId}/stored_data',
    name: 'cartesgouvfr_api_stored_data_',
    options: ['expose' => true])]
#[OA\Tag(name: '[entrepot] stored_data')]
class StoredDataController extends AbstractController implements ApiControllerInterface
{
    use PaginatedHeadersTrait;

    public function __construct(
        private StoredDataApiService $storedDataApiService,
        private ConfigurationApiService $configurationApiService,
        private ProcessingApiService $processingApiService,
        private CartesStoredDataApiService $cartesStoredDataApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getList(
        string $datastoreId,
        Request $request,
        #[MapQueryParameter] ?bool $detailed = false,
        #[MapQueryParameter] ?bool $all = false,
    ): JsonResponse {
        $query = $request->query->all();
        unset($query['detailed']);
        unset($query['all']);

        if ($all) {
            return $this->json(
                $detailed
                ? $this->storedDataApiService->getAllDetailed($datastoreId, $query)
                : $this->storedDataApiService->getAll($datastoreId, $query)->resolve()
            );
        }

        $apiResponse = $detailed
            ? $this->storedDataApiService->getListDetailed($datastoreId, $query)
            : $this->storedDataApiService->getList($datastoreId, $query);

        $response = new JsonResponse($apiResponse->content, Response::HTTP_OK);
        $this->setPaginatedHeaders($response, $apiResponse->headers);

        return $response;
    }

    #[Route('/{storedDataId}', name: 'get', methods: ['GET'])]
    public function get(string $datastoreId, string $storedDataId): JsonResponse
    {
        try {
            $storedData = $this->storedDataApiService->get($datastoreId, $storedDataId)->array();

            return $this->json($storedData);
        } catch (ApiException $ex) {
            if (Response::HTTP_NOT_FOUND === $ex->getStatusCode()) {
                throw new AppException("La donnée stockée [$storedDataId] n'existe pas", $ex->getStatusCode(), $ex->getDetails(), $ex);
            }
            if (Response::HTTP_BAD_REQUEST === $ex->getStatusCode()) {
                throw new AppException("L'identifiant de la donnée stockée [$storedDataId] est invalide", $ex->getStatusCode(), $ex->getDetails(), $ex);
            }
            throw $ex;
        }
    }

    #[Route('/{storedDataId}/uses', name: 'get_uses', methods: ['GET'])]
    public function getUses(string $datastoreId, string $storedDataId): JsonResponse
    {
        $offeringsList = $this->configurationApiService->getAllOfferings($datastoreId, [
            'stored_data' => $storedDataId,
        ])->resolve();

        return $this->json([
            'offerings_list' => $offeringsList,
        ]);
    }

    #[Route('/{storedDataId}/details', name: 'get_details', methods: ['GET'], requirements: ['storedDataId' => Requirement::UUID_V4])]
    public function getDetails(string $datastoreId, string $storedDataId, CartesDataDetailsService $dataDetailsService): JsonResponse
    {
        return $this->json($dataDetailsService->getStoredDataDetails($datastoreId, $storedDataId));
    }

    // journaux lus à l’ouverture d’une étape du rapport, première page seulement
    #[Route('/{storedDataId}/processing_executions/{executionId}/logs', name: 'get_processing_logs', methods: ['GET'], requirements: ['storedDataId' => Requirement::UUID_V4, 'executionId' => Requirement::UUID_V4])]
    public function getProcessingLogs(string $datastoreId, string $executionId): JsonResponse
    {
        return $this->json($this->processingApiService->getExecutionLogs($datastoreId, $executionId)->array());
    }

    #[Route('/{storedDataId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $storedDataId): JsonResponse
    {
        $this->cartesStoredDataApiService->delete($datastoreId, $storedDataId);

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }
}
