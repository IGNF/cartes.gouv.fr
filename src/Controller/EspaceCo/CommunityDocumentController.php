<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\CommunityDocumentApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route(
    '/api/espaceco/community/{communityId}/document',
    name: 'cartesgouvfr_api_espaceco_community_document_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class CommunityDocumentController extends AbstractController implements ApiControllerInterface
{
    private string $varDataPath;

    public function __construct(
        ParameterBagInterface $parameters,
        private Filesystem $fs,
        private CommunityDocumentApiService $communityDocumentApiService,
    ) {
        $this->varDataPath = $parameters->get('upload_path');
    }

    /**
     * @param array<string> $fields
     */
    #[Route('/get_all', name: 'get_all', methods: ['GET'])]
    public function getAll(
        int $communityId,
        #[MapQueryParameter] ?array $fields = [],
    ): JsonResponse {
        try {
            $response = $this->communityDocumentApiService->getDocuments($communityId, $fields);

            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/add', name: 'add', methods: ['POST'])]
    public function addDocument(int $communityId, Request $request): JsonResponse
    {
        try {
            $title = $request->request->get('title');
            $description = $request->request->get('description');

            $document = $request->files->get('document');

            $uuid = Uuid::v4();
            $tempFileDir = join(DIRECTORY_SEPARATOR, [$this->varDataPath, $uuid]);
            $tempFilePath = join(DIRECTORY_SEPARATOR, [$tempFileDir, $document->getClientOriginalName()]);

            $document->move($tempFileDir, $document->getClientOriginalName());

            $response = $this->communityDocumentApiService->addDocument($communityId, $title, $description, $tempFilePath);
            $this->fs->remove($tempFileDir);

            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/update/{documentId}', name: 'update', methods: ['PATCH'])]
    public function updateDocument(int $communityId, int $documentId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            $response = $this->communityDocumentApiService->updateDocument($communityId, $documentId, $data);

            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/delete/{documentId}', name: 'delete', methods: ['DELETE'])]
    public function deleteDocument(int $communityId, int $documentId): JsonResponse
    {
        try {
            $this->communityDocumentApiService->deleteDocument($communityId, $documentId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
