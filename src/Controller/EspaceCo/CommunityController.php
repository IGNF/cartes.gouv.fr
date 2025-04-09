<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\CommunityApiService;
use App\Services\EspaceCoApi\UserApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/community',
    name: 'cartesgouvfr_api_espaceco_community_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class CommunityController extends AbstractController implements ApiControllerInterface
{
    public const SEARCH_LIMIT = 20;

    public function __construct(
        private CommunityApiService $communityApiService,
        private UserApiService $userApiService,
    ) {
    }

    #[Route('/get', name: 'get', methods: ['GET'])]
    public function get(
        #[MapQueryParameter] ?string $name = '',
        #[MapQueryParameter] ?int $page = 1,
        #[MapQueryParameter] ?int $limit = 10,
        #[MapQueryParameter] ?string $sort = 'name:DESC',
    ): JsonResponse {
        try {
            $response = $this->communityApiService->getCommunities($name, $page, $limit, $sort);

            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/get_as_member', name: 'get_as_member', methods: ['GET'])]
    public function getMeMember(
        #[MapQueryParameter] bool $pending,
        #[MapQueryParameter] ?int $page = 1,
        #[MapQueryParameter] ?int $limit = 10,
    ): JsonResponse {
        try {
            $me = $this->userApiService->getMe();
            $members = array_map(function ($member) {
                return ['id' => $member['community_id'], 'name' => $member['community_name'], 'role' => $member['role']];
            }, $me['communities_member']);

            $members = array_filter($members, function ($member) use ($pending) {
                return $pending ? 'pending' === $member['role'] : 'pending' !== $member['role'];
            });

            $this->_sortMembersByName($members);
            $members = array_slice(array_values($members), ($page - 1) * $limit, $limit);

            $communities = [];
            foreach ($members as $member) {
                $community = $this->communityApiService->getCommunity($member['id']);
                $communities[] = $community;
            }

            $totalPages = floor(count($members) / $limit) + 1;
            $previousPage = 1 === $page ? null : $page - 1;
            $nextPage = $page + 1 > $totalPages ? null : $page + 1;

            return new JsonResponse([
                'content' => $communities,
                'totalPages' => $totalPages,
                'previousPage' => $previousPage,
                'nextPage' => $nextPage,
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/search', name: 'search', methods: ['GET'])]
    public function search(
        #[MapQueryParameter] string $name,
        #[MapQueryParameter] string $filter,
        #[MapQueryParameter] string $sort,
    ): JsonResponse {
        try {
            if (!in_array($filter, ['public', 'iam_member', 'affiliation'])) {
                throw new ApiException('Le filtre doit être public, iam_member ou affiliation');
            }

            if ('public' == $filter) {
                $result = $this->communityApiService->getCommunities($name, 1, self::SEARCH_LIMIT, $sort);
                $response = $result['content'];
            } else {
                $response = $this->_search($name, 'iam_member' !== $filter);
            }

            return new JsonResponse($response);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @return array<mixed>
     */
    private function _search(string $name, bool $pending): array
    {
        $me = $this->userApiService->getMe();
        $members = array_map(function ($member) {
            return ['id' => $member['community_id'], 'name' => $member['community_name'], 'role' => $member['role']];
        }, $me['communities_member']);

        $regex = mb_strtoupper(str_replace('%', '', $name));
        $members = array_filter($members, function ($member) use ($regex, $pending) {
            $communityName = mb_strtoupper($member['name']);
            $match = preg_match("/$regex/", $communityName);

            return $pending ? ('pending' === $member['role'] && $match) : ('pending' !== $member['role'] && $match);
        });

        $this->_sortMembersByName($members);
        $members = array_slice(array_values($members), 0, self::SEARCH_LIMIT);

        $communities = [];
        foreach ($members as $member) {
            $community = $this->communityApiService->getCommunity($member['id']);
            $communities[] = $community;
        }

        return $communities;
    }

    /**
     * @param array<mixed> $members
     */
    private function _sortMembersByName(array &$members): void
    {
        usort($members, function ($m1, $m2) {
            $upM1 = mb_strtoupper($m1['name']);
            $upM2 = mb_strtoupper($m2['name']);

            if ($upM1 == $upM2) {
                return 0;
            }

            return ($upM1 < $upM2) ? -1 : 1;
        });
    }
}
