<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class CommunityApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
        private readonly UserApiService $userApiService,
        private readonly GridApiService $gridApiService,
    ) {
    }

    public function getCommunities(string $name, int $page, int $limit, string $sort): array
    {
        $response = $this->api->get('communities', ['name' => $name, 'page' => $page, 'limit' => $limit, 'sort' => $sort])->jsonWithHeaders();

        $totalPages = $response->getPageCount($limit) ?? 1;

        $previousPage = 1 === $page ? null : $page - 1;
        $nextPage = $page + 1 > $totalPages ? null : $page + 1;

        return [
            'content' => $response->content,
            'totalPages' => $totalPages,
            'previousPage' => $previousPage,
            'nextPage' => $nextPage,
        ];
    }

    public function getCommunitiesName(): array
    {
        $communities = $this->api->requestAll('communities', ['fields' => ['name'], 'sort' => 'name:ASC']);

        return array_map(fn ($community) => $community['name'], $communities);
    }

    /**
     * @param array<mixed> $fields
     */
    public function getCommunity(int $communityId, ?array $fields = []): PendingResponse
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->get("communities/$communityId", $query);
    }

    /**
     * @param array<mixed> $datas
     */
    public function addCommunity(array $datas, ?string $logoFilePath): array
    {
        if ($logoFilePath) {
            $response = $this->api->sendFile('POST', 'communities', $logoFilePath, $datas, [], 'logo')->json();
        } else {
            $response = $this->api->post('communities', $datas)->json();
        }

        return $response;
    }

    /**
     * @param array<mixed> $datas
     */
    public function updateCommunity(int $communityId, array $datas): PendingResponse
    {
        return $this->api->patch("communities/$communityId", $datas);
    }

    /**
     * @param array<string> $roles
     *
     * @return array<mixed>
     */
    public function getCommunityMembers(int $communityId, array $roles): array
    {
        $query = ['fields' => 'user_id, grids, role, active, date'];
        $query['roles'] = count($roles) ? $roles : ['member', 'admin'];

        $members = $this->api->requestAll("communities/$communityId/members", $query);

        $gridsRequested = [];
        foreach ($members as &$member) {
            $user = $this->userApiService->getUser($member['user_id'], ['fields' => ['username', 'firstname', 'surname']])->json();
            $member = array_merge($member, $user);

            // Ajout des grids
            $member['grids'] = $this->_transformGrids($member['grids'], $gridsRequested);
        }

        usort($members, function ($mb1, $mb2) {
            if ($mb1['username'] == $mb2['username']) {
                return 0;
            }

            return (mb_strtolower($mb1['username'], 'UTF-8') < mb_strtolower($mb2['username'], 'UTF-8')) ? -1 : 1;
        });

        return $members;
    }

    public function addMember(int $communityId, int $userId): PendingResponse
    {
        return $this->api->post("communities/$communityId/members/$userId", ['user_id' => $userId]);
    }

    public function updateMember(int $communityId, int $userId, string $field, mixed $value): array
    {
        $member = $this->api->patch("communities/$communityId/members/$userId", [$field => $value])->json();
        if ('grids' === $field) {   // On recupere les grids, pas seulement leur nom
            $member['grids'] = $this->_transformGrids($member['grids']);
        }

        return $member;
    }

    public function removeMember(int $communityId, int $userId): PendingResponse
    {
        return $this->api->delete("communities/$communityId/members/$userId");
    }

    public function updateLogo(int $communityId, string $filePath): array
    {
        return $this->api->sendFile('POST', "communities/$communityId/logo", $filePath, [], [], 'logo')->json();
    }

    public function removeLogo(int $communityId): PendingResponse
    {
        return $this->api->delete("communities/$communityId/logo");
    }

    /**
     * @param array<string> $grids
     * @param array<mixed>  $gridsRequested
     */
    private function _transformGrids(array $grids, array &$gridsRequested = []): array
    {
        $result = [];
        $gridsForMember = [];
        foreach ($grids as $name) {
            $grid = null;
            if (array_key_exists($name, $gridsRequested)) {
                $grid = $gridsRequested[$name];
            } else {
                $g = $this->gridApiService->get($name)->json();
                if (!($g['deleted'] ?? false)) {
                    $grid = $g;
                }
            }

            if (!is_null($grid)) {
                $result[] = $grid;
                $gridsForMember[$name] = $grid;
            }
        }

        $gridsRequested = $gridsRequested + $gridsForMember;

        return $result;
    }
}
