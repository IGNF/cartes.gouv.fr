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

    /**
     * @return array<mixed>
     */
    public function getCommunity(int $communityId): array
    {
        return $this->request('GET', "communities/$communityId");
    }

    public function updateLogo(int $communityId, UploadedFile $file): array
    {
        return $this->request('PATCH', "communities/$communityId", ['logo' => $file], [], [], true);
    }
}
