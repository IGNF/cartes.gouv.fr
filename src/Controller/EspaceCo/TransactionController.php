<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\TransactionApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route(
    '/api/espaceco/databases/{databaseId}/transactions',
    name: 'cartesgouvfr_api_espaceco_databases_transactions_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] transaction', description: "Ensemble de modifications apportées à des données d'une base de données")]
class TransactionController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private TransactionApiService $transactionApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getAll(string $databaseId, Request $request): JsonResponse
    {
        try {
            $query = $request->query->all();
            ['content' => $content, 'headers' => $headers] = $this->transactionApiService->getList($databaseId, $query);

            $response = new JsonResponse($content, Response::HTTP_PARTIAL_CONTENT);
            $response->headers->set('Content-Range', $headers['content-range'][0]);

            return $response;
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(string $databaseId, Request $request): JsonResponse
    {
        try {
            $body = json_decode($request->getContent(), true);

            $report = $this->transactionApiService->add($databaseId, $body);

            return $this->json($report);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{transactionId}', name: 'get', methods: ['GET'], requirements: ['transactionId' => Requirement::DIGITS])]
    public function get(string $databaseId, string $transactionId): JsonResponse
    {
        try {
            return $this->json($this->transactionApiService->get($databaseId, $transactionId));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
