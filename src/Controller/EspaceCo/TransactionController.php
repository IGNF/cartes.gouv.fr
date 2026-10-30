<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
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
        private readonly TransactionApiService $transactionApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getAll(string $databaseId, Request $request): JsonResponse
    {
        $query = $request->query->all();
        $result = $this->transactionApiService->getList($databaseId, $query);
        $content = $result->content;
        $headers = $result->headers;

        $response = new JsonResponse($content, Response::HTTP_PARTIAL_CONTENT);
        $response->headers->set('Content-Range', $headers['content-range'][0]);

        return $response;
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(string $databaseId, Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);

        $report = $this->transactionApiService->add($databaseId, $body)->array();

        return $this->json($report);
    }

    #[Route('/{transactionId}', name: 'get', methods: ['GET'], requirements: ['transactionId' => Requirement::DIGITS])]
    public function get(string $databaseId, string $transactionId): JsonResponse
    {
        return $this->json($this->transactionApiService->get($databaseId, $transactionId)->array());
    }
}
