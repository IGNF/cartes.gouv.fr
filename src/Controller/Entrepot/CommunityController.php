<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\Community;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\CommunityApiService;
use App\Services\EntrepotApi\UserApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/community/{communityId}',
    name: 'cartesgouvfr_api_community_'
)]
class CommunityController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private CommunityApiService $communityApiService,
        private UserApiService $userApiService,
    ) {
    }

    #[Route('/get', name: 'get', methods: ['GET'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function get(string $communityId): JsonResponse
    {
        try {
            $community = $this->communityApiService->get($communityId);

            return new JsonResponse($community);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/members', name: 'members', methods: ['GET'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function getMembers(string $communityId): JsonResponse
    {
        try {
            $members = $this->communityApiService->getMembers($communityId);

            return new JsonResponse($members);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/update_member', name: 'add_member', methods: ['PUT'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function updateMember(string $communityId, Request $request): JsonResponse
    {
        try {
            $me = $this->userApiService->getMe();

            // Suis-je membre de cette communaute
            $communityMember = array_values(array_filter($me['communities_member'], function ($member) use ($communityId) {
                return $member['community']['_id'] == $communityId;
            }));
            if (0 === count($communityMember)) {
                throw new CartesApiException("Vous n'êtes pas membre de cette communauté", JsonResponse::HTTP_BAD_REQUEST);
            }

            // Ai-je le droit de modifier les membres ?
            if (!$this->_allowedToModifyMembers($communityMember[0], $me)) {
                throw new CartesApiException("Vous n'avez pas les droits pour ajouter un utilisateur ou modifier ses permissions", JsonResponse::HTTP_BAD_REQUEST);
            }

            $data = json_decode($request->getContent(), true);
            $userId = $data['user_id'];
            $rights = $data['user_rights'];

            // Si c'est une creation, on verifie qu'il n'existe pas deja
            if (isset($data['user_creation'])) {
                $communityMembers = $this->communityApiService->getMembers($communityId);
                foreach ($communityMembers as $member) {
                    if ($member['user']['_id'] == $userId) {
                        throw new CartesApiException("l'utilisateur $userId est déjà membre de cette communauté", JsonResponse::HTTP_BAD_REQUEST);
                    }
                }
            }

            // Verification des droits
            $this->_checkRights($rights);

            $this->communityApiService->addOrModifyUserRights($communityId, $userId, ['rights' => $rights]);

            return new JsonResponse([
                'user' => $userId,
                'rights' => $rights,
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/remove_member', name: 'remove_member', methods: ['DELETE'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function removeMember(string $communityId, Request $request): JsonResponse
    {
        try {
            $me = $this->userApiService->getMe();

            // Suis-je membre de cette communaute
            $communityMember = array_values(array_filter($me['communities_member'], function ($member) use ($communityId) {
                return $member['community']['_id'] == $communityId;
            }));
            if (0 === count($communityMember)) {
                throw new CartesApiException("Vous n'êtes pas membre de cette communauté", JsonResponse::HTTP_BAD_REQUEST);
            }

            // Ai-je le droit de modifier les membres ?
            if (!$this->_allowedToModifyMembers($communityMember[0], $me)) {
                throw new CartesApiException("Vous n'avez pas les droits pour supprimer un membre de cette communauté", JsonResponse::HTTP_BAD_REQUEST);
            }

            $data = json_decode($request->getContent(), true);
            $userId = $data['user_id'];

            $this->communityApiService->removeUserRights($communityId, $userId);

            return new JsonResponse(['user' => $userId]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * Verifie que les droits sont corrects.
     *
     * @param array<string> $userRights
     *
     * @return void
     */
    private function _checkRights($userRights)
    {
        foreach ($userRights as $right) {
            if (!in_array($right, Community::RIGHTS)) {
                throw new CartesApiException("Le droit $right n'existe pas", JsonResponse::HTTP_BAD_REQUEST);
            }
        }
    }

    /**
     * Vérifie que je peux modifier les membres de la communauté :
     *  - si je suis superviseur
     *  - si j'ai le droit COMMUNITY
     *
     * @param array<mixed> $communityMember
     * @param array<mixed> $me
     *
     * @return bool
     */
    private function _allowedToModifyMembers($communityMember, $me)
    {
        if ($me['_id'] === $communityMember['community']['supervisor']) {
            return true;
        }

        if (in_array('COMMUNITY', $communityMember['rights'])) {
            return true;
        }

        return false;
    }
}
