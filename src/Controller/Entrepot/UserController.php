<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\UserKeyTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\User\UserKeyDTO;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Security\User;
use App\Services\EntrepotApi\ServiceAccount;
use App\Services\EntrepotApi\UserApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/user',
    name: 'cartesgouvfr_api_user_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class UserController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private UserApiService $userApiService,
    ) {
    }

    #[Route('/me', name: 'me')]
    public function getCurrentUser(): JsonResponse
    {
        /** @var User */
        $user = $this->getUser();

        $apiUserInfo = $this->userApiService->getMe();

        if (array_key_exists('communities_member', $apiUserInfo)) {
            $user->setCommunitiesMember($apiUserInfo['communities_member']);
        }

        return $this->json($user);
    }

    #[Route('/me/keys', name: 'keys')]
    public function getUserKeys(): JsonResponse
    {
        $keys = $this->userApiService->getMyKeys();

        return $this->json($keys);
    }

    #[Route('/me/keys_with_accesses', name: 'keys_detailed_with_accesses')]
    public function getUserKeysDetailedWithAccesses(): JsonResponse
    {
        $myKeys = $this->userApiService->getMyKeys();

        $keys = [];
        foreach ($myKeys as $key) {
            $keys[] = $this->_getUserKeyWithAccesses($key['_id']);
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
        $permissions = $this->userApiService->getMyPermissions();

        return $this->json($permissions);
    }

    #[Route('/add_key', name: 'add_key', methods: ['POST'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function addKey(#[MapRequestPayload] UserKeyDTO $dto): JsonResponse
    {
        try {
            $filter = ['accesses', 'ip_list_name', 'ip_list_addresses'];

            $body = array_filter((array) $dto, function ($value, $key) use ($filter) {
                return !(null === $value || '' === $value || in_array($key, $filter));
            }, ARRAY_FILTER_USE_BOTH);

            // Les adresses IP
            if ($dto->ip_list_addresses && 0 !== count($dto->ip_list_addresses)) {
                $body[$dto->ip_list_name] = $dto->ip_list_addresses;
            }

            if (UserKeyTypes::HASH === $dto->type || UserKeyTypes::OAUTH2 === $dto->type) {
                $body['type_infos'] = (object) null;
            }

            // Ajout de la cle
            $key = $this->userApiService->addKey($body);

            // Ajout des acces
            foreach ($dto->accesses as $access) {
                $accessBody = (array) $access;
                $this->userApiService->addAccess($key['_id'], $accessBody);
            }

            $keyWithAccesses = $this->_getUserKeyWithAccesses($key['_id']);

            return new JsonResponse($keyWithAccesses);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/update_key/{keyId}', name: 'update_key', methods: ['PATCH'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function updateKey(string $keyId, #[MapRequestPayload] UserKeyDTO $dto): JsonResponse
    {
        $filter = ['type', 'type_infos', 'accesses', 'ip_list_name', 'ip_list_addresses'];

        try {
            $body = array_filter((array) $dto, function ($value, $key) use ($filter) {
                return !(null === $value || '' === $value || in_array($key, $filter));
            }, ARRAY_FILTER_USE_BOTH);

            $key = $this->userApiService->getMyKey($keyId);

            // Nom identique, on supprime du body
            if ($dto->name === $key['name']) {
                unset($body['name']);
            }

            // Les adresses IP : elles sont exclusives => soit whitelist, soit blacklist peut
            // contenir des adresses
            $body['whitelist'] = $body['blacklist'] = [];
            if ($dto->ip_list_addresses && 0 !== count($dto->ip_list_addresses)) {
                $body[$dto->ip_list_name] = $dto->ip_list_addresses;
            }

            // Modification de la cle
            $updatedKey = $this->userApiService->updateKey($keyId, $body);

            // Suppression de tous les accces pour cette cle
            $accesses = $this->userApiService->getKeyAccesses($keyId);
            foreach ($accesses as $access) {
                $this->userApiService->removeAccess($keyId, $access['_id']);
            }

            // Ajout des nouveaux access
            foreach ($dto->accesses as $access) {
                $accessBody = (array) $access;
                $this->userApiService->addAccess($key['_id'], $accessBody);
            }

            $updatedKey['accesses'] = $this->userApiService->getKeyAccesses($key['_id']);

            return new JsonResponse($updatedKey);
        } catch (ApiException $ex) {
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
            $this->userApiService->removeKey($keyId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
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

            $myDatastores = $this->userApiService->getMyDatastores();
            if (!is_null($sandboxCommunity)) {
                $myDatastores = array_values(array_filter($myDatastores, function ($myDatastore) use ($sandboxCommunity) {
                    return $myDatastore['_id'] != $sandboxCommunity['datastore']['_id'];
                }));

                $sandboxCommunity['datastore']['is_sandbox'] = true;
                $sandboxCommunity['datastore']['name'] = 'Découverte';
                array_unshift($myDatastores, $sandboxCommunity['datastore']);
            }

            return $this->json($myDatastores);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('me/add_to_sandbox', name: 'add_to_sandbox', methods: ['PUT'])]
    public function addMemberToSandbox(ServiceAccount $serviceAccount): JsonResponse
    {
        $serviceAccount->addCurrentUserToSandbox();

        return new JsonResponse();
    }

    private function _getUserKeyWithAccesses(string $keyId): array
    {
        $key = $this->userApiService->getMyKey($keyId);
        $key['accesses'] = $this->userApiService->getKeyAccesses($key['_id']);

        return $key;
    }
}
