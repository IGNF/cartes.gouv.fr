<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\ReportApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route(
    '/api/espaceco',
    name: 'cartesgouvfr_api_espaceco_report_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] reports', description: 'Signalements géolocalisés')]
class ReportController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private ReportApiService $reportApiService,
    ) {
    }

    #[Route('/reports', name: 'get_list', methods: ['GET'])]
    public function getList(Request $request): JsonResponse
    {
        try {
            $page = $request->query->get('page', 1);
            $limit = $request->query->get('limit', 10);
            $query = $request->query->all();

            ['content' => $content, 'headers' => $headers] = $this->reportApiService->getList($page, $limit, $query);

            $response = new JsonResponse($content, Response::HTTP_PARTIAL_CONTENT);
            $response->headers->set('Content-Range', $headers['content-range'][0]);

            return $response;
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/reports', name: 'add', methods: ['POST'])]
    public function add(Request $request): JsonResponse
    {
        try {
            $body = json_decode($request->getContent(), true);

            $report = $this->reportApiService->add($body);

            return $this->json($report);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/reports/{reportId}', name: 'get', methods: ['GET'], requirements: ['reportId' => Requirement::DIGITS])]
    public function get(string $reportId): JsonResponse
    {
        try {
            return $this->json($this->reportApiService->get($reportId));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/reports/{reportId}', name: 'replace', methods: ['PUT'])]
    public function replace(string $reportId, Request $request): Response
    {
        try {
            $body = json_decode($request->getContent(), true);

            $report = $this->reportApiService->replace($reportId, $body);

            return $this->json($report);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/reports/{reportId}', name: 'modify', methods: ['PATCH'])]
    public function modify(string $reportId, Request $request): Response
    {
        try {
            $body = json_decode($request->getContent(), true);

            $report = $this->reportApiService->modify($reportId, $body);

            return $this->json($report);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/reports/{reportId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $reportId): Response
    {
        try {
            $report = $this->reportApiService->delete($reportId);

            return $this->json($report, Response::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/reports/{reportId}/attachments', name: 'add_attachments', methods: ['POST'])]
    public function addAttachments(/* string $reportId, Request $request */): JsonResponse
    {
        throw new CartesApiException('Route non implémentée', Response::HTTP_NOT_IMPLEMENTED);
        // try {
        //     $files = $request->files->all();

        //     return $this->json($this->reportApiService->addAttachments($reportId, $files));
        // } catch (ApiException $ex) {
        //     throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        // }
    }

    #[Route('/reports/{reportId}/attachments/{attachmentId}', name: 'delete_attachment', methods: ['DELETE'])]
    public function deleteAttachment(string $reportId, string $attachmentId): JsonResponse
    {
        try {
            $report = $this->reportApiService->deleteAttachment($reportId, $attachmentId);

            return $this->json($report, Response::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/reports/rss', name: 'get_rss', methods: ['GET'])]
    public function getRss(): Response
    {
        try {
            $rss = $this->reportApiService->getRss();

            return new Response($rss, Response::HTTP_OK, [
                'Content-Type' => 'application/xml',
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/reports/wfs', name: 'get_wfs', methods: ['GET'])]
    public function getWfs(Request $request): Response
    {
        try {
            $wfs = $this->reportApiService->getWfs($request->query->all());

            $contentType = str_starts_with($wfs, '<?xml') ? 'application/xml' : 'application/json';

            return new Response($wfs, Response::HTTP_OK, [
                'Content-Type' => $contentType,
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
