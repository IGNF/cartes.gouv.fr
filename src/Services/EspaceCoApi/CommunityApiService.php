<?php

namespace App\Services\EspaceCoApi;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class CommunityApiService extends BaseEspaceCoApiService
{
    public function __construct(HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        RequestStack $requestStack,
        LoggerInterface $logger,
        private UserApiService $userApiService,
        private GridApiService $gridApiService,
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
        $communities = $this->requestAll('communities', ['fields' => ['name'], 'sort' => 'name:ASC']);

        return array_map(fn ($community) => $community['name'], $communities);
    }

    /**
     * @param array<mixed> $fields
     *
     * @return array<mixed>
     */
    public function getCommunity(int $communityId, ?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->request('GET', "communities/$communityId", [], $query);
    }

    /**
     * @param array<mixed> $datas
     */
    public function addCommunity(array $datas, ?string $logoFilePath): array
    {
        $formFields = $datas;
        if ($logoFilePath) {
            $formFields['logo'] = DataPart::fromPath($logoFilePath);
        }

        $formData = new FormDataPart($formFields);
        $body = $formData->bodyToIterable();
        $headers = $formData->getPreparedHeaders()->toArray();

        return $this->request('POST', 'communities', $body, [], $headers, true);
    }

    /**
     * @param array<mixed> $datas
     */
    public function updateCommunity(int $communityId, array $datas): array
    {
        return $this->request('PATCH', "communities/$communityId", $datas);
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

        $members = $this->requestAll("communities/$communityId/members", $query);

        $gridsRequested = [];
        foreach ($members as &$member) {
            $user = $this->userApiService->getUser($member['user_id'], ['fields' => ['username', 'firstname', 'surname']]);
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

    public function addMember(int $communityId, int $userId): array
    {
        return $this->request('POST', "communities/$communityId/members/$userId", ['user_id' => $userId]);
    }

    public function updateMember(int $communityId, int $userId, string $field, mixed $value): array
    {
        $member = $this->request('PATCH', "communities/$communityId/members/$userId", [$field => $value]);
        if ('grids' === $field) {   // On recupere les grids, pas seulement leur nom
            $member['grids'] = $this->_transformGrids($member['grids']);
        }

        return $member;
    }

    public function removeMember(int $communityId, int $userId): array
    {
        return $this->request('DELETE', "communities/$communityId/members/$userId");
    }

    public function updateLogo(int $communityId, string $filePath): array
    {
        return $this->sendFile('POST', "communities/$communityId/logo", $filePath, [], [], 'logo');
    }

    public function removeLogo(int $communityId): array
    {
        return $this->request('DELETE', "communities/$communityId/logo");
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
                $g = $this->gridApiService->getGrid($name);
                if (!$g['deleted']) {
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
