<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Services\EspaceCoApi\ReportApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Uid\Uuid;

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
        private readonly ReportApiService $reportApiService,
    ) {
    }

    #[Route('/reports', name: 'get_list', methods: ['GET'])]
    public function getList(Request $request): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $query = $request->query->all();

        $result = $this->reportApiService->getList($page, $limit, $query);
        $content = $result->content;
        $headers = $result->headers;

        $response = new JsonResponse($content, Response::HTTP_PARTIAL_CONTENT);
        $response->headers->set('Content-Range', $headers['content-range'][0]);

        return $response;
    }

    #[Route('/reports', name: 'add', methods: ['POST'])]
    public function add(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);

        $report = $this->reportApiService->add($body)->array();

        return $this->json($report);
    }

    #[Route('/reports/{reportId}', name: 'get', methods: ['GET'], requirements: ['reportId' => Requirement::DIGITS])]
    public function get(string $reportId): JsonResponse
    {
        return $this->json($this->reportApiService->get($reportId)->array());
    }

    #[Route('/reports/{reportId}', name: 'replace', methods: ['PUT'])]
    public function replace(string $reportId, Request $request): Response
    {
        $body = json_decode($request->getContent(), true);

        $report = $this->reportApiService->replace($reportId, $body)->array();

        return $this->json($report);
    }

    #[Route('/reports/{reportId}', name: 'modify', methods: ['PATCH'])]
    public function modify(string $reportId, Request $request): Response
    {
        $body = json_decode($request->getContent(), true);

        $report = $this->reportApiService->modify($reportId, $body)->array();

        return $this->json($report);
    }

    #[Route('/reports/{reportId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $reportId): Response
    {
        $report = $this->reportApiService->delete($reportId)->array();

        return $this->json($report, Response::HTTP_NO_CONTENT);
    }

    #[Route('/reports/{reportId}/attachments', name: 'add_attachments', methods: ['POST'])]
    #[OA\Post(
        summary: 'Ajouter un ou plusieurs fichiers à un signalement',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(
                            property: 'file1',
                            type: 'string',
                            format: 'binary',
                        ),
                        new OA\Property(
                            property: 'file2',
                            type: 'string',
                            format: 'binary',
                        ),
                    ],
                    type: 'object',
                )
            )
        ),
    )]
    public function addAttachments(string $reportId, Request $request): JsonResponse
    {
        /** @var array<string,UploadedFile> $uploadedFiles */
        $uploadedFiles = $request->files->all();

        $fs = new Filesystem();
        $fileDir = implode(DIRECTORY_SEPARATOR, [(string) $this->getParameter('var_data_path'), 'documents', Uuid::v4()]);
        $fs->mkdir($fileDir);

        $files = [];
        foreach ($uploadedFiles as $fieldName => $file) {
            $filepath = implode(DIRECTORY_SEPARATOR, [$fileDir, $file->getClientOriginalName()]);

            $file->move($fileDir, $filepath);
            $files[$fieldName] = $filepath;
        }

        return $this->json($this->reportApiService->addAttachments($reportId, $files)->array());
    }

    #[Route('/reports/{reportId}/attachments/{attachmentId}', name: 'delete_attachment', methods: ['DELETE'])]
    public function deleteAttachment(string $reportId, string $attachmentId): JsonResponse
    {
        $report = $this->reportApiService->deleteAttachment($reportId, $attachmentId)->array();

        return $this->json($report, Response::HTTP_NO_CONTENT);
    }

    #[Route('/reports/rss', name: 'get_rss', methods: ['GET'])]
    public function getRss(): Response
    {
        $rss = $this->reportApiService->getRss()->text();

        return new Response($rss, Response::HTTP_OK, [
            'Content-Type' => 'application/xml',
        ]);
    }

    #[Route('/reports/wfs', name: 'get_wfs', methods: ['GET'])]
    public function getWfs(Request $request): Response
    {
        $wfs = $this->reportApiService->getWfs($request->query->all())->text();

        $contentType = str_starts_with($wfs, '<?xml') ? 'application/xml' : 'application/json';

        return new Response($wfs, Response::HTTP_OK, [
            'Content-Type' => $contentType,
        ]);
    }
}
