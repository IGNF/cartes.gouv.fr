<?php

namespace App\Controller\Api;

use App\Dto\UserKeyDTO;
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

    #[Route('/me/permissions', name: 'permissions')]
    public function getUserPermissions(): JsonResponse
    {
        $permissions = $this->entrepotApiService->user->getMyPermissions();
        return $this->json($permissions);
    }

    #[Route('/add_key', name: 'add_key', methods: ['POST'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function addKey(#[MapRequestPayload] UserKeyDTO $dto): JsonResponse
    {
        try {
            $body = array_filter((array) $dto, function($value) {
                return !is_null($value);
            });
            unset($body['access']);
    
            // Ajout de la cle
            $key = $this->entrepotApiService->user->addKey($body);
            return new JsonResponse($key); 
            
            // TODO Ajout de l'acces
        }
        catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/remove_key/{key}', name: 'remove_key', methods: ['DELETE'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function removeKey(string $key): JsonResponse
    {
        try {
            $this->entrepotApiService->user->removeKey($key);
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
}
