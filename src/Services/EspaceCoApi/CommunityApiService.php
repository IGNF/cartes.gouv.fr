<?php

namespace App\Services\EspaceCoApi;

use Symfony\Component\HttpFoundation\File\UploadedFile;

class CommunityApiService extends BaseEspaceCoApiService
{
    public function getCommunities(string $name, int $page, int $limit, string $sort): array
    {
        $response = $this->request('GET', 'communities', [], ['name' => $name, 'page' => $page, 'limit' => $limit, 'sort' => $sort], [], false, true, true);

        $contentRange = $response['headers']['content-range'][0];
        $totalPages = $this->getResultsPageCount($contentRange, $limit);

        $previousPage = 1 === $page ? null : $page - 1;
        $nextPage = $page + 1 > $totalPages ? null : $page + 1;

        return [
            'content' => $response['content'],
            'totalPages' => $totalPages,
            'previousPage' => $previousPage,
            'nextPage' => $nextPage,
        ];
    }

    public function getCommunitiesName(): array
    {
        $communities = $this->requestAll('communities', ['fields' => 'name']);

        return array_map(fn ($community) => $community['name'], $communities);
    }

    /**
     * @return array<mixed>
     */
    public function getCommunity(int $communityId): array
    {
        return $this->request('GET', "communities/$communityId");
    }

    /**
     * @param array<string> $roles
     *
     * @return array<mixed>
     */
    public function getCommunityMembers(int $communityId, array $roles, int $page, int $limit): array
    {
        $query = ['fields' => 'user_id,emprises,role,active,date', 'page' => $page, 'limit' => $limit];
        if (count($roles)) {
            $query['roles'] = $roles;
        }

        $response = $this->request('GET', "communities/$communityId/members", [], $query, [], false, true, true);

        $contentRange = $response['headers']['content-range'][0];
        $totalPages = $this->getResultsPageCount($contentRange, $limit);
        $previousPage = 1 === $page ? null : $page - 1;
        $nextPage = $page + 1 > $totalPages ? null : $page + 1;

        $members = $response['content'];
        foreach ($members as &$member) {
            $userId = $member['user_id'];
            $user = $this->request('GET', "users/$userId");
            $member = array_merge($member, $user);
        }

        usort($members, function ($mb1, $mb2) {
            if ($mb1['username'] == $mb2['username']) {
                return 0;
            }

            return (mb_strtolower($mb1['username'], 'UTF-8') < mb_strtolower($mb2['username'], 'UTF-8')) ? -1 : 1;
        });

        return [
            'content' => $members,
            'totalPages' => $totalPages,
            'previousPage' => $previousPage,
            'nextPage' => $nextPage,
        ];
    }

    public function updateLogo(int $communityId, UploadedFile $file): array
    {
        return $this->request('PATCH', "communities/$communityId", ['logo' => $file], [], [], true);
    }
}
