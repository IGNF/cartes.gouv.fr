<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\UserDocumentsApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
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
        private UserDocumentsApiService $userDocumentsApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getAll(Request $request, #[MapQueryParameter] ?bool $detailed): Response
    {
        try {
            return $this->json(
                true === $detailed
                ? $this->userDocumentsApiService->getAllDetailed($request->query->all())
                 : $this->userDocumentsApiService->getAll($request->query->all()));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{documentId}', name: 'get', methods: ['GET'])]
    public function get(string $documentId): Response
    {
        try {
            return $this->json($this->userDocumentsApiService->get($documentId));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(Request $request): Response
    {
        try {
            /** @var UploadedFile */
            $file = $request->files->get('file');
            $name = $request->request->get('name');
            $description = $request->request->get('description');
            $labels = $request->request->get('labels') ? explode(',', $request->request->get('labels')) : null;
            $publicUrl = $request->request->get('public_url', false);

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
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{documentId}', name: 'modify', methods: ['PATCH'])]
    public function modify(string $documentId, Request $request): Response
    {
        try {
            $data = json_decode($request->getContent(), true);

            return $this->json($this->userDocumentsApiService->modify(
                $documentId,
                $data['name'] ?? null,
                $data['description'] ?? null,
                $data['extra'] ?? null,
                $data['labels'] ?? null,
                $data['public_url'] ?? null
            ));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{documentId}', name: 'replace_file', methods: ['POST'])]
    public function replaceFile(string $documentId, Request $request): Response
    {
        try {
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
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{documentId}', name: 'remove', methods: ['DELETE'])]
    public function remove(string $documentId): Response
    {
        try {
            return $this->json($this->userDocumentsApiService->remove($documentId), Response::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{documentId}/file', name: 'download', methods: ['GET'])]
    public function download(string $documentId): Response
    {
        try {
            return new Response($this->userDocumentsApiService->download($documentId));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{documentId}/sharings', name: 'sharings_get', methods: ['GET'])]
    public function getSharings(string $documentId): Response
    {
        try {
            return $this->json($this->userDocumentsApiService->getSharings($documentId));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{documentId}/sharings', name: 'sharings_add', methods: ['POST'])]
    public function addSharing(string $documentId, Request $request): Response
    {
        try {
            $userIds = json_decode($request->getContent(), true);

            return $this->json($this->userDocumentsApiService->addSharing($documentId, $userIds));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{documentId}/sharings', name: 'sharings_remove', methods: ['DELETE'])]
    public function removeSharing(string $documentId, Request $request): Response
    {
        try {
            $userIds = explode(',', $request->query->get('users', ''));

            return $this->json($this->userDocumentsApiService->removeSharing($documentId, $userIds));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }
}
