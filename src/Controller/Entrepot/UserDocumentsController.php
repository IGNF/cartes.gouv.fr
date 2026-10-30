<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Services\EntrepotApi\UserDocumentsApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route(
    '/api/users/me/documents',
    name: 'cartesgouvfr_api_user_me_documents_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[entrepot] user documents')]
class UserDocumentsController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly UserDocumentsApiService $userDocumentsApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getList(Request $request, #[MapQueryParameter] ?bool $detailed): Response
    {
        $query = $request->query->all();
        unset($query['detailed']);

        $apiResponse = $this->userDocumentsApiService->getList([
            ...$query,
            'detailed' => $detailed,
        ]);

        $response = new JsonResponse($apiResponse->content, Response::HTTP_OK);

        if (isset($apiResponse->headers['content-range'])) {
            $response->headers->set('content-range', $apiResponse->headers['content-range'][0] ?? '');
        }
        if (isset($apiResponse->headers['link'])) {
            $response->headers->set('link', $apiResponse->headers['link'][0] ?? '');
        }

        return $response;
    }

    #[Route('/{documentId}', name: 'get', methods: ['GET'])]
    public function get(string $documentId): Response
    {
        return $this->json($this->userDocumentsApiService->get($documentId)->array());
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(Request $request): Response
    {
        /** @var UploadedFile */
        $file = $request->files->get('file');
        $name = $request->request->getString('name');
        $description = $request->request->has('description') ? $request->request->getString('description') : null;
        $labelsField = $request->request->getString('labels');
        $labels = $labelsField ? explode(',', $labelsField) : null;
        // case à cocher : « on » si cochée, absente sinon
        $publicUrl = $request->request->getBoolean('public_url');

        $filePath = implode(DIRECTORY_SEPARATOR, [(string) $this->getParameter('var_data_path'), 'documents', Uuid::v4(), $file->getClientOriginalName()]);
        $fileDir = dirname($filePath);

        $fs = new Filesystem();
        $fs->mkdir($fileDir);
        $file->move($fileDir, $file->getClientOriginalName());

        return $this->json($this->userDocumentsApiService->add(
            $filePath,
            $name,
            $description,
            $labels,
            $publicUrl
        ));
    }

    #[Route('/{documentId}', name: 'modify', methods: ['PATCH'])]
    public function modify(string $documentId, Request $request): Response
    {
        $data = json_decode($request->getContent(), true);

        return $this->json($this->userDocumentsApiService->modify(
            $documentId,
            $data['name'] ?? null,
            $data['description'] ?? null,
            $data['extra'] ?? null,
            $data['labels'] ?? null,
            $data['public_url'] ?? null
        )->array());
    }

    #[Route('/{documentId}', name: 'replace_file', methods: ['POST'])]
    public function replaceFile(string $documentId, Request $request): Response
    {
        $file = $request->files->get('file');

        $filePath = implode(DIRECTORY_SEPARATOR, [(string) $this->getParameter('var_data_path'), 'documents', Uuid::v4(), $file->getClientOriginalName()]);
        $fileDir = dirname($filePath);

        $fs = new Filesystem();
        $fs->mkdir($fileDir);
        $file->move($fileDir, $file->getClientOriginalName());

        return $this->json($this->userDocumentsApiService->replaceFile(
            $documentId,
            $filePath
        ));
    }

    #[Route('/{documentId}', name: 'remove', methods: ['DELETE'])]
    public function remove(string $documentId): Response
    {
        $this->userDocumentsApiService->remove($documentId)->await();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/{documentId}/file', name: 'download', methods: ['GET'])]
    public function download(string $documentId): Response
    {
        return new Response($this->userDocumentsApiService->download($documentId)->text());
    }

    #[Route('/{documentId}/sharings', name: 'sharings_get', methods: ['GET'])]
    public function getSharings(string $documentId): Response
    {
        return $this->json($this->userDocumentsApiService->getSharings($documentId)->array());
    }

    #[Route('/{documentId}/sharings', name: 'sharings_add', methods: ['POST'])]
    public function addSharing(string $documentId, Request $request): Response
    {
        $userIds = json_decode($request->getContent(), true);

        return $this->json($this->userDocumentsApiService->addSharing($documentId, $userIds)->array());
    }

    #[Route('/{documentId}/sharings', name: 'sharings_remove', methods: ['DELETE'])]
    public function removeSharing(string $documentId, Request $request): Response
    {
        $userIds = explode(',', $request->query->get('users', ''));

        return $this->json($this->userDocumentsApiService->removeSharing($documentId, $userIds)->array());
    }
}
