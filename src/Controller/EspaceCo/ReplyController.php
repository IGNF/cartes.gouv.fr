<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\ReplyApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/reports/{reportId}/replies',
    name: 'cartesgouvfr_api_espaceco_report_reply_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] reply', description: 'Réponses/commentaires aux signalements')]
class ReplyController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private ReplyApiService $replyApiService,
    ) {
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(string $reportId, Request $request): JsonResponse
    {
        try {
            $body = json_decode($request->getContent(), true);

            $report = $this->replyApiService->add($reportId, $body);

            return $this->json($report);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{replyId}', name: 'replace', methods: ['PUT'])]
    public function replace(string $reportId, string $replyId, Request $request): JsonResponse
    {
        try {
            $body = json_decode($request->getContent(), true);

            $report = $this->replyApiService->replace($reportId, $replyId, $body);

            return $this->json($report);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{replyId}', name: 'modify', methods: ['PATCH'])]
    public function modify(string $reportId, string $replyId, Request $request): JsonResponse
    {
        try {
            $body = json_decode($request->getContent(), true);

            $report = $this->replyApiService->modify($reportId, $replyId, $body);

            return $this->json($report);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
