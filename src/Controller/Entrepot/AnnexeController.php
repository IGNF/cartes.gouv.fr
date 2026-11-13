<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Controller\Traits\PaginatedHeadersTrait;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\RSSFeed\RSSFeed;
use App\Utils;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route(
    '/api/datastores/{datastoreId}/annexe',
    name: 'cartesgouvfr_api_annexe_',
    options: ['expose' => true])]
#[OA\Tag(name: '[entrepot] annexes')]
class AnnexeController extends AbstractController implements ApiControllerInterface
{
    use PaginatedHeadersTrait;

    public function __construct(
        private AnnexeApiService $annexeApiService,
        private RSSFeed $rssFeed,
    ) {
    }

    /**
     * @param array<string>|null $labels
     */
    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getList(
        string $datastoreId,
        #[MapQueryParameter] ?string $path,
        #[MapQueryParameter] ?array $labels,
        #[MapQueryParameter('mime_type')] ?string $mimeType,
        #[MapQueryParameter] ?bool $all,
        Request $request,
    ): JsonResponse {
        $query = $request->query->all();
        unset($query['all']);

        if ($all) {
            return $this->json($this->annexeApiService->getAll($datastoreId, $mimeType, $path, $labels)->resolve());
        }

        $apiResponse = $this->annexeApiService->getList($datastoreId, $query);
        $response = new JsonResponse($apiResponse->content, Response::HTTP_OK);
        $this->setPaginatedHeaders($response, $apiResponse->headers);

        return $response;
    }

    #[Route('/{annexeId}', name: 'modify', methods: ['PATCH'])]
    public function modify(string $datastoreId, string $annexeId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        return $this->json(
            $this->annexeApiService->modify(
                $datastoreId,
                $annexeId,
                $data['paths'] ?? null,
                $data['labels'] ?? null,
                $data['published'] ?? null
            )->array()
        );
    }

    #[Route('/add', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        $name = $file->getClientOriginalName();
        $path = $request->request->getString('path');

        // Clear RSSFeed cache
        if (str_contains($name, 'alerts.json')) {
            $this->rssFeed->clearCache();
        }

        return new JsonResponse($this->annexeApiService->add($datastoreId, $file->getRealPath(), [$path]));
    }

    #[Route('/{annexeId}/file', name: 'get_file_content', methods: ['GET'], requirements: ['annexeId' => Requirement::UUID_V4])]
    public function getFileContent(string $datastoreId, string $annexeId): Response
    {
        $fileContent = $this->annexeApiService->download($datastoreId, $annexeId)->text();

        $response = new Response($fileContent);
        $response->headers->set('Content-Type', Utils::guess_content_type($fileContent));
        // $response->headers->set('Content-Disposition', 'inline; filename="'.$annexeId.'"');
        $response->headers->set('Content-Length', ''.strlen($fileContent));

        return $response;
    }

    /**
     * Requirement::UUID_V4 : sinon cette route intercepte `POST /add`.
     */
    #[Route('/{annexeId}', name: 'replace_file', methods: ['POST'], requirements: ['annexeId' => Requirement::UUID_V4])]
    public function replaceFile(string $datastoreId, string $annexeId, Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        $name = $file->getClientOriginalName();

        // Clear RSSFeed cache
        if (str_contains($name, 'alerts.json')) {
            $this->rssFeed->clearCache();
        }

        return $this->json(
            $this->annexeApiService->replaceFile($datastoreId, $annexeId, $file->getRealPath())
        );
    }

    #[Route('/{annexeId}', name: 'delete', methods: ['DELETE'])]
    public function deleteAnnexe(string $datastoreId, string $annexeId): JsonResponse
    {
        $this->annexeApiService->remove($datastoreId, $annexeId)->await();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }
}
