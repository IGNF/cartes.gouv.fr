<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Controller\Traits\PaginatedHeadersTrait;
use App\Services\EntrepotApi\StaticApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/statics',
    name: 'cartesgouvfr_api_statics_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[entrepot] statics')]
class StaticController extends AbstractController implements ApiControllerInterface
{
    use PaginatedHeadersTrait;

    public function __construct(
        private StaticApiService $staticApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getList(
        string $datastoreId,
        Request $request,
        #[MapQueryParameter] ?bool $all,
    ): JsonResponse {
        $query = $request->query->all();
        unset($query['all']);

        if ($all) {
            return $this->json($this->staticApiService->getAll($datastoreId, $query)->resolve());
        }

        $apiResponse = $this->staticApiService->getList($datastoreId, $query);
        $response = new JsonResponse($apiResponse->content, Response::HTTP_OK);
        $this->setPaginatedHeaders($response, $apiResponse->headers);

        return $response;
    }

    #[Route('/{staticFileId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $staticFileId): JsonResponse
    {
        $this->staticApiService->delete($datastoreId, $staticFileId)->await();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }

    #[Route('/{staticFileId}', name: 'get_file_content', methods: ['GET'])]
    public function getFileContent(string $datastoreId, string $staticFileId): Response
    {
        $xmlFileContent = $this->staticApiService->downloadFile($datastoreId, $staticFileId)->text();

        return new Response($xmlFileContent, Response::HTTP_OK, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
