<?php

namespace App\Services\EntrepotApi;

class CatalogsApiService extends AbstractEntrepotApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getPublicCommunities(array $query = []): mixed
    {
        $response = $this->request('GET', 'catalogs/communities', [], $query, [], false, true, true);

        $contentRange = $response['headers']['content-range'][0];
        $numPages = $this->getResultsPageCount($contentRange, $query['limit']);

        return [
            'communities' => $response['content'],
            'numPages' => $numPages,
        ];
    }
}
