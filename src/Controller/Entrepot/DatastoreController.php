<?php

namespace App\Controller\Entrepot;

use App\Constants\PermissionTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Datastore\PermissionDTO;
use App\Dto\Datastore\UpdatePermissionDTO;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores',
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
        #[MapQueryParameter] ?string $type = null,
        #[MapQueryParameter] ?bool $open = null
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

    #[Route('/{datastoreId}/permission/{permissionId}', name: 'get_permission', methods: ['GET'])]
    public function getPermission(string $datastoreId, string $permissionId): JsonResponse
    {
        $permission = $this->entrepotApiService->datastore->getPermission($datastoreId, $permissionId);

        return $this->json($permission);
    }

    #[Route('/{datastoreId}/add_permission', name: 'add_permission', methods: ['POST'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function addPermission(string $datastoreId, #[MapRequestPayload] PermissionDTO $dto): JsonResponse
    {
        $body = json_decode(json_encode($dto), true);
        if (PermissionTypes::COMMUNITY === $dto->type) {
            $body['communities'] = $dto->beneficiaries;
        } else {
            $body['users'] = $dto->beneficiaries;
        }
        unset($body['beneficiaries']);

        // Ajout de la permission
        $permission = $this->entrepotApiService->datastore->addPermission($datastoreId, $body);

        return $this->json($permission);
    }

    #[Route('{datastoreId}/update_permission/{permissionId}', name: 'update_permission', methods: ['PATCH'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function updatePermission(string $datastoreId, string $permissionId, #[MapRequestPayload] UpdatePermissionDTO $dto): JsonResponse
    {
        try {
            $body = json_decode(json_encode($dto), true);
            $permission = $this->entrepotApiService->datastore->updatePermission($datastoreId, $permissionId, $body);

            return $this->json($permission);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
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
