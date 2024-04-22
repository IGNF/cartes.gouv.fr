<?php

namespace App\Services\EspaceCoApi;

class CommunityApiService extends BaseEspaceCoApiService
{
    public function get(int $page = 1,int $limit = 10): array
    {
        $response = $this->request('GET', "communities", [], ['page' => $page, 'limit' => $limit], [], false, true, true);
        
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
}