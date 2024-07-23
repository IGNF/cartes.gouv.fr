<?php

namespace App\Services\EspaceCoApi;

class GridApiService extends BaseEspaceCoApiService
{
    public function getGrids(string $text, string $searchBy, string $fields, string $adm, int $page, int $limit): array
    {
        $query = ['text' => $text, 'page' => $page, 'limit' => $limit];
        if ($searchBy) {
            $query['searchBy'] = $searchBy;
        }
        if ($fields) {
            $query['fields'] = $fields;
        }
        if ($adm) {
            $query['adm'] = $adm;
        }

        $response = $this->request('GET', 'grids', [], $query, [], false, true, true);

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
}
