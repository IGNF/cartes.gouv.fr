<?php

namespace App\Services\EspaceCoApi;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class CommunityApiService extends BaseEspaceCoApiService
{
    public function __construct(HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        RequestStack $requestStack,
        LoggerInterface $logger,
        private UserApiService $userApiService,
        private GridApiService $gridApiService
    ) {
        parent::__construct($httpClient, $parameters, $filesystem, $requestStack, $logger);
    }

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
        $communities = $this->requestAll('communities', ['fields' => 'name', 'sort' => 'name:ASC']);

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
        $query = ['fields' => 'user_id, grids, role, active, date', 'page' => $page, 'limit' => $limit];
        $query['roles'] = count($roles) ? $roles : ['member', 'admin'];

        $response = $this->request('GET', "communities/$communityId/members", [], $query, [], false, true, true);

        $contentRange = $response['headers']['content-range'][0];
        $totalPages = $this->getResultsPageCount($contentRange, $limit);
        $previousPage = 1 === $page ? null : $page - 1;
        $nextPage = $page + 1 > $totalPages ? null : $page + 1;

        $members = $response['content'];
        foreach ($members as &$member) {
            $user = $this->userApiService->getUser($member['user_id'], ['fields' => ['username', 'firstname', 'surname']]);
            $member = array_merge($member, $user);

            // Ajout des grids
            $grids = [];
            foreach ($member['grids'] as $name) {
                $grid = $this->gridApiService->getGrid($name);
                if (!$grid['deleted']) {
                    $grids[] = $grid;
                }
            }
            $member['grids'] = $grids;
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

    public function updateMember(int $communityId, int $userId, string $field, mixed $value): array
    {
        return $this->request('PATCH', "communities/$communityId/members/$userId", [$field => $value]);
    }

    public function removeMember(int $communityId, int $userId): array
    {
        return $this->request('DELETE', "communities/$communityId/members/$userId");
    }

    public function updateLogo(int $communityId, UploadedFile $file): array
    {
        return $this->request('PATCH', "communities/$communityId", ['logo' => $file], [], [], true);
    }
}
