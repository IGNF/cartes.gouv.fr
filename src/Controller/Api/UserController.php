<?php

namespace App\Controller\Api;

use App\Dto\User\UserKeyDTO;
use App\Services\ServiceAccount;
use App\Services\EntrepotApiService;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route(
    '/api/user',
    name: 'cartesgouvfr_api_user_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class UserController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/me', name: 'me')]
    public function getCurrentUser(): JsonResponse
    {
        return $this->json($this->getUser());
    }

    #[Route('/me/keys', name: 'keys')]
    public function getUserKeys(): JsonResponse
    {
        $keys = $this->entrepotApiService->user->getMyKeys();
        return $this->json($keys);
    }

    #[Route('/me/keys_with_accesses', name: 'keys_with_accesses')]
    public function getUserKeysWithAccesses(): JsonResponse
    {
        $keys = $this->entrepotApiService->user->getMyKeys();
        foreach($keys as &$key) {
            $key['accesses'] = $this->entrepotApiService->user->getKeyAccesses($key['_id']);
        }
        return $this->json($keys);
    }

    #[Route('/me/key_with_accesses/{keyId}', name: 'key_with_accesses')]
    public function getUserKeyWithAccesses(string $keyId): JsonResponse
    {
        $keyWithAccesses = $this->_getUserKeyWithAccesses($keyId);
        return $this->json($keyWithAccesses);
    }

    #[Route('/me/permissions', name: 'permissions')]
    public function getUserPermissions(): JsonResponse
    {
        $permissions = $this->entrepotApiService->user->getMyPermissions();
        return $this->json($permissions);
    }

    #[Route('/me/permissions_detailed', name: 'permissions_detailed')]
    public function getUserPermissionsDetailed(): JsonResponse
    {
        $detailedPermissions = [];

        $permissions = $this->entrepotApiService->user->getMyPermissions();
        foreach($permissions as $permission) {
            $detailedPermissions[] = $this->entrepotApiService->user->getPermission($permission['_id']);
        }
        return $this->json($detailedPermissions);
    }

    #[Route('/add_key', name: 'add_key', methods: ['POST'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function addKey(#[MapRequestPayload] UserKeyDTO $dto): JsonResponse
    {
        try {   
            $filter = ['accesses', 'ip_list_name', 'ip_list_addresses'];

            $body = array_filter((array) $dto, function($value, $key) use ($filter) {
                return ! ($value === null || $value === '' || in_array($key, $filter));
            }, ARRAY_FILTER_USE_BOTH);

            // Les adresses IP
            if (0 !== count($dto->ip_list_addresses)) {
                $body[$dto->ip_list_name] = $dto->ip_list_addresses;  
            }

            if ($dto->type === "OAUTH2") {
                $body['type_infos'] = (object) null;
            }

            // Ajout de la cle
            $key = $this->entrepotApiService->user->addKey($body);
            
            // Ajout des acces
            foreach($dto->accesses as $access) {
                $accessBody = (array)$access;
                $this->entrepotApiService->user->addAccess($key['_id'], $accessBody);    
            }

            $keyWithAccesses = $this->_getUserKeyWithAccesses($key['_id']);
            return new JsonResponse($keyWithAccesses);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/update_key/{keyId}', name: 'update_key', methods: ['PATCH'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function updateKey(string $keyId, #[MapRequestPayload] UserKeyDTO $dto): JsonResponse
    {
        $filter = ['type', 'type_infos', 'accesses', 'ip_list_name', 'ip_list_addresses', ];
      
        try { 
            $body = array_filter((array) $dto, function($value, $key) use ($filter) {
                return ! ($value === null || $value === '' || in_array($key, $filter));
            }, ARRAY_FILTER_USE_BOTH);
           
            $key = $this->entrepotApiService->user->getMyKey($keyId);

            // Nom identique, on supprime du body
            if ($dto->name === $key['name']) {
                unset($body['name']);
            }

            // Les adresses IP : elles sont exclusives => soit whitelist, soit blacklist peut
            // contenir des adresses
            $body['whitelist'] = $body['blacklist'] = [];
            if (0 !== count($dto->ip_list_addresses)) {
                $body[$dto->ip_list_name] = $dto->ip_list_addresses;
            }

            // Modification de la cle
            $updatedKey = $this->entrepotApiService->user->updateKey($keyId, $body);

            // Suppression de tous les accces pour cette cle
            $accesses = $this->entrepotApiService->user->getKeyAccesses($keyId);
            foreach($accesses as $access) {
                $this->entrepotApiService->user->removeAccess($keyId, $access['_id']);      
            }
            
            // Ajout des nouveaux access
            foreach($dto->accesses as $access) {
                $accessBody = (array)$access;
                $this->entrepotApiService->user->addAccess($key['_id'], $accessBody);    
            }

            $updatedKey['accesses'] = $this->entrepotApiService->user->getKeyAccesses($key['_id']);
            return new JsonResponse($updatedKey);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/remove_key/{keyId}', name: 'remove_key', methods: ['DELETE'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function removeKey(string $keyId): JsonResponse
    {
        try {
            $this->entrepotApiService->user->removeKey($keyId);
            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/me/datastores', name: 'datastores_list')]
    public function getUserDatastores(ServiceAccount $serviceAccount): JsonResponse
    {
        try {
            // Peut etre null si SANDBOX_COMMUNITY_ID n'est pas defini dans .env
            // ou si cette valeur est erronee
            $sandboxCommunity = $serviceAccount->getSandboxCommunity();

            $myDatastores = $this->entrepotApiService->user->getMyDatastores();
            if (! is_null($sandboxCommunity)) {
                $myDatastores = array_values(array_filter($myDatastores, function ($myDatastore) use ($sandboxCommunity) {
                    return $myDatastore['_id'] != $sandboxCommunity['datastore']['_id'];
                }));
                array_unshift($myDatastores, $sandboxCommunity['datastore']);
            }
            
            return $this->json($myDatastores);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('me/add_to_sandbox', name: 'add_to_sandbox', methods: ['PUT'])]
    public function addMemberToSandbox(ServiceAccount $serviceAccount): JsonResponse
    {
        $serviceAccount->addCurrentUserToSandbox();
        return new JsonResponse();
    }

    private function _getUserKeyWithAccesses(string $keyId): Array
    {
        $key = $this->entrepotApiService->user->getMyKey($keyId);
        $key['accesses'] = $this->entrepotApiService->user->getKeyAccesses($key['_id']);
        return $key;
    }
}
