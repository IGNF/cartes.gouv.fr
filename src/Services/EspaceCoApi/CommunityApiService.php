<?php

namespace App\Services\EspaceCoApi;

class CommunityApiService extends BaseEspaceCoApiService
{
    public function getCommunities(string $name, int $page,int $limit, string $sort): array
    {
        $response = $this->request('GET', "communities", [], ['name' => $name, 'page' => $page, 'limit' => $limit, 'sort' => $sort], [], false, true, true);
        
        $contentRange = $response['headers']['content-range'][0];
        $totalPages = $this->getResultsPageCount($contentRange, $limit);

        $previousPage = $page === 1 ? null : $page - 1;
        $nextPage = $page + 1 > $totalPages ? null : $page + 1;

        return [
            'content' => $response['content'],
            'totalPages' => $totalPages,
            'previousPage' => $previousPage,
            'nextPage' => $nextPage,
        ];
    }

    /**
     * @param string $communityId
     * @return array<mixed>
     */
    public function getCommunity(string $communityId) : array {
        return $this->request('GET', "communities/$communityId");
    }
}