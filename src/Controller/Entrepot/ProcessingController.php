<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\ProcessingApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/processing',
    name: 'cartesgouvfr_api_processing_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[entrepot] processing')]
class ProcessingController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private ProcessingApiService $processingApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getList(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $query = $request->query->all();

            $uploadList = $this->processingApiService->getAll($datastoreId, $query);

            return $this->json($uploadList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/executions', name: 'execution_get_list', methods: ['GET'])]
    public function getExecutionList(string $datastoreId, Request $request, #[MapQueryParameter] ?bool $detailed = false,
    ): JsonResponse {
        try {
            $query = $request->query->all();
            if (isset($query['detailed'])) {
                unset($query['detailed']);
            }

            $uploadList = $detailed ? $this->processingApiService->getAllExecutionsDetailed($datastoreId, $query) : $this->processingApiService->getAllExecutions($datastoreId, $query);

            return $this->json($uploadList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }
}
