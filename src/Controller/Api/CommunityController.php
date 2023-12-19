<?php

namespace App\Controller\Api;

use App\Services\EntrepotApiService;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Constants\EntrepotApi\Community;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;


#[Route(
    '/api/community/{communityId}',
    name: 'cartesgouvfr_api_community_'
)]
class CommunityController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/get', name: 'get', methods: ['GET'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function get(string $communityId) : JsonResponse{
        try {
            $community = $this->entrepotApiService->community->get($communityId);
            return new JsonResponse($community);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    } 

    #[Route('/members', name: 'members', methods: ['GET'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function getMembers(string $communityId) : JsonResponse{
        try {
            $members = $this->entrepotApiService->community->getMembers($communityId);
            return new JsonResponse($members);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/update_member', name: 'add_member', methods: ['PUT'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function updateMember(string $communityId, Request $request) : JsonResponse{
        try {
            $me = $this->entrepotApiService->user->getMe();

            // Suis-je membre de cette communaute
            $communityMember = array_filter($me['communities_member'], function ($member) use ($communityId) {
                return $member['community']['_id'] == $communityId;
            });
            if (0 === count($communityMember)) {
                throw new CartesApiException("Vous n'êtes pas membre de cette communauté", JsonResponse::HTTP_BAD_REQUEST);    
            }

            // Ai-je les droits (COMMUNITY)
            if (! in_array('COMMUNITY', $communityMember[0]['rights'])) {
                throw new CartesApiException("Vous n'avez pas les droits pour ajouter un utilisateur", JsonResponse::HTTP_BAD_REQUEST);        
            }

            $data = json_decode($request->getContent(), true);
            $userId = $data['user_id'];
            $rights = $data['user_rights'];

            // Si c'est une creation, on verifie qu'il n'existe pas deja
            if (isset($data['user_creation'])) {
                $communityMembers = $this->entrepotApiService->community->getMembers($communityId);
                foreach($communityMembers as $member) {
                    if ($member['user']['_id'] == $userId) {
                        throw new CartesApiException("l'utilisateur $userId est déjà membre de cette communauté", JsonResponse::HTTP_BAD_REQUEST);    
                    }
                }
            }
            
            // Verification des droits
            $this->_checkRights($rights);

            $this->entrepotApiService->community->addOrModifyUserRights($communityId, $userId, ['rights' => $rights]);
            return new JsonResponse([
                'user' => $userId,
                'rights' => $rights
            ]);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    
    #[Route('/remove_member', name: 'remove_member', methods: ['DELETE'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function removeMember(string $communityId, Request $request) : JsonResponse {
        try {
            $me = $this->entrepotApiService->user->getMe();

            // Suis-je membre de cette communaute
            $communityMember = array_filter($me['communities_member'], function ($member) use ($communityId) {
                return $member['community']['_id'] == $communityId;
            });
            if (0 === count($communityMember)) {
                throw new CartesApiException("Vous n'êtes pas membre de cette communauté", JsonResponse::HTTP_BAD_REQUEST);    
            }

            // Ai-je les droits (COMMUNITY)
            if (! in_array('COMMUNITY', $communityMember[0]['rights'])) {
                throw new CartesApiException("Vous n'avez pas les droits pour ajouter un utilisateur", JsonResponse::HTTP_BAD_REQUEST);        
            }

            $data = json_decode($request->getContent(), true);
            $userId = $data['user_id'];
            
            $this->entrepotApiService->community->removeUserRights($communityId, $userId);
            return new JsonResponse(['user' => $userId]);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * Verifie que les droits sont corrects
     *
     * @param array<string> $userRights
     * @return void
     */
    private function _checkRights($userRights)
    {
        foreach($userRights as $right) {
            if (! in_array($right, Community::RIGHTS)) {
                throw new CartesApiException("Le droit $right n'existe pas", JsonResponse::HTTP_BAD_REQUEST);    
            }
        }
    }
}