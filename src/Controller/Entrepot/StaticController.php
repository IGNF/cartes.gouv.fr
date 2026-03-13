<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Controller\Traits\PaginatedHeadersTrait;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
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
        try {
            $query = $request->query->all();
            unset($query['all']);

            if ($all) {
                return $this->json($this->staticApiService->getAll($datastoreId, $query));
            }

            $apiResponse = $this->staticApiService->getList($datastoreId, $query);
            $response = new JsonResponse($apiResponse['content'], Response::HTTP_OK);
            $this->setPaginatedHeaders($response, $apiResponse['headers'] ?? []);

            return $response;
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{staticFileId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $staticFileId): JsonResponse
    {
        try {
            $this->staticApiService->delete($datastoreId, $staticFileId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{staticFileId}', name: 'get_file_content', methods: ['GET'])]
    public function getFileContent(string $datastoreId, string $staticFileId): Response
    {
        try {
            $xmlFileContent = $this->staticApiService->downloadFile($datastoreId, $staticFileId);

            return new Response($xmlFileContent, Response::HTTP_OK, [
                'Content-Type' => 'application/xml',
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
