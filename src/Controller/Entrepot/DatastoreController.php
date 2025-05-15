<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\PermissionTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Datastore\PermissionDTO;
use App\Dto\Datastore\UpdatePermissionDTO;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\ServiceAccount;
use App\Services\SandboxService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores',
    name: 'cartesgouvfr_api_datastore_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[entrepot] datastores')]
class DatastoreController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private DatastoreApiService $datastoreApiService,
        private SandboxService $sandboxService,
        private ServiceAccount $serviceAccount,
    ) {
    }

    #[Route('/sandbox', name: 'get_sandbox', methods: ['GET'])]
    public function getSandboxDatastore(): JsonResponse
    {
        try {
            $sandboxCommunity = $this->serviceAccount->getSandboxCommunity();
            $datastore = $sandboxCommunity['datastore'];

            $datastore['is_sandbox'] = true;
            $datastore['name'] = 'Découverte';

            return $this->json($datastore);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{datastoreId}', name: 'get', methods: ['GET'])]
    public function getDatastore(string $datastoreId): JsonResponse
    {
        try {
            $datastore = $this->datastoreApiService->get($datastoreId);
            $datastore['is_sandbox'] = $this->sandboxService->isSandboxDatastore($datastore['_id']);
            if (true === $datastore['is_sandbox']) {
                $datastore['name'] = 'Découverte';
            }

            return $this->json($datastore);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{datastoreId}/endpoints', name: 'get_endpoints', methods: ['GET'])]
    public function getEndpoints(
        string $datastoreId,
        #[MapQueryParameter] ?string $type = null,
        #[MapQueryParameter] ?bool $open = null,
    ): JsonResponse {
        $endpoints = $this->datastoreApiService->getEndpointsList($datastoreId, [
            'type' => $type,
            'open' => $open,
        ]);

        return $this->json($endpoints);
    }

    #[Route('/{datastoreId}/permissions', name: 'get_permissions', methods: ['GET'])]
    public function getPermissions(string $datastoreId, Request $request): JsonResponse
    {
        $permissions = $this->datastoreApiService->getPermissions($datastoreId, $request->query->all());

        return $this->json($permissions);
    }

    #[Route('/{datastoreId}/permission/{permissionId}', name: 'get_permission', methods: ['GET'])]
    public function getPermission(string $datastoreId, string $permissionId): JsonResponse
    {
        $permission = $this->datastoreApiService->getPermission($datastoreId, $permissionId);

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
        $permission = $this->datastoreApiService->addPermission($datastoreId, $body);

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
            $permission = $this->datastoreApiService->updatePermission($datastoreId, $permissionId, $body);

            return $this->json($permission);
        } catch (ApiException $ex) {
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
            $this->datastoreApiService->removePermission($datastoreId, $permissionId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
