<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\UserDocumentsApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/users/me/documents',
    name: 'cartesgouvfr_api_user_me_documents_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class UserDocumentsController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private UserDocumentsApiService $userDocumentsApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getAll(Request $request): Response
    {
        try {
            return $this->json($this->userDocumentsApiService->getAll($request->query->all()));
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
            $file = $request->files->get('file');
            $name = $request->request->get('name');
            $description = $request->request->get('description');
            $labels = $request->request->get('labels') ? explode(',', $request->request->get('labels')) : null;

            return $this->json($this->userDocumentsApiService->add(
                $file->getRealPath(),
                $name,
                $description,
                $labels
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

    #[Route('/{documentId}', name: 'replace_file', methods: ['PUT'])]
    public function replaceFile(string $documentId, Request $request): Response
    {
        try {
            $file = $request->files->get('file');

            return $this->json($this->userDocumentsApiService->replaceFile(
                $documentId,
                $file->getRealPath()
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
