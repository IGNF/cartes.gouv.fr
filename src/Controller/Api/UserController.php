<?php

namespace App\Controller\Api;

use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use App\Services\ServiceAccount;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
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
        private readonly EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/me', name: 'me')]
    public function getCurrentUser(): JsonResponse
    {
        return $this->json($this->getUser());
    }

    #[Route('/me/access_keys_and_permissions', name: 'access_keys_and_permissions')]
    public function getUserAccessKeysAndPermissions(): JsonResponse
    {
        $keys = $this->entrepotApiService->user->getMyAccessKeys();
        $permissions = $this->entrepotApiService->user->getPermissions();
        return $this->json(['access_keys' => $keys, 'permissions' => $permissions]);
    }

    #[Route('/me/permissions', name: 'permissions')]
    public function getUserPermissions(): JsonResponse
    {
        $permissions = $this->entrepotApiService->user->getPermissions();
        return $this->json($permissions);
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
