<?php

namespace App\Controller\Api;

use App\Constants\PermissionTypes;
use App\Dto\Datastore\PermissionDTO;
use App\Services\EntrepotApiService;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route(
    '/api/datastore',
    name: 'cartesgouvfr_api_datastore_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class DatastoreController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/{datastoreId}', name: 'get', methods: ['GET'])]
    public function getDatastore(string $datastoreId): JsonResponse
    {
        return $this->json($this->entrepotApiService->datastore->get($datastoreId));
    }

    #[Route('/{datastoreId}/endpoints', name: 'get_endpoints', methods: ['GET'])]
    public function getEndpoints(
        string $datastoreId,
        #[MapQueryParameter] string $type = null,
        #[MapQueryParameter] bool $open = null
    ): JsonResponse {
        $endpoints = $this->entrepotApiService->datastore->getEndpointsList($datastoreId, [
            'type' => $type,
            'open' => $open,
        ]);

        return $this->json($endpoints);
    }

    #[Route('/{datastoreId}/permissions', name: 'get_permissions', methods: ['GET'])]
    public function getPermissions(string $datastoreId): JsonResponse
    {
        $permissions = $this->entrepotApiService->datastore->getPermissions($datastoreId);
        return $this->json($permissions);
    }

    #[Route('/{datastoreId}/add_permission', name: 'add_permission', methods: ['POST'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function addPermission(string $datastoreId, #[MapRequestPayload] PermissionDTO $dto): JsonResponse
    {
        $body = json_decode(json_encode($dto), true);
        if ($dto->type === PermissionTypes::COMMUNITY) {
            $body['communities'] = $dto->beneficiaries;
        } else {
            $body['users'] = $dto->beneficiaries;
        }
        unset($body['beneficiaries']);

        // Ajout de la permission
        $permission = $this->entrepotApiService->datastore->addPermission($datastoreId, $body);
        return $this->json($permission);
    }

    #[Route('{datastoreId}/remove_permission/{permissionId}', name: 'remove_permission', methods: ['DELETE'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function removePermission(string $datastoreId, string $permissionId): JsonResponse
    {
        try {
            $this->entrepotApiService->datastore->removePermission($datastoreId, $permissionId);
            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
