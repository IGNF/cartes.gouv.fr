<?php

namespace App\Services\EspaceCoApi;

class GridApiService extends BaseEspaceCoApiService
{
    public function getGrids(string $text, ?string $searchBy, ?string $fields, ?string $adm, int $page, int $limit): array
    {
        $query = ['text' => $text, 'page' => $page, 'limit' => $limit];
        if (!is_null($searchBy)) {
            $query['searchBy'] = $searchBy;
        }
        if (!is_null($fields)) {
            $query['fields'] = $fields;
        }
        if (!is_null($adm)) {
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

    /**
     * @param array<string> $fields
     */
    public function getGrid(string $gridName, array $fields = []): array
    {
        $f = empty($fields) ? ['name', 'title', 'deleted', 'type'] : $fields;

        return $this->request('GET', "grids/$gridName", [], ['fields' => $f]);
    }

    /**
     * @param array<string> $names
     */
    public function getGridsFromNames(array $names): array
    {
        $grids = [];
        foreach ($names as $gridName) {
            $grid = $this->getGrid($gridName);
            if (!$grid['deleted']) {
                $grids[] = $grid;
            }
        }

        return $grids;
    }
}
