<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class GridApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    public function getAll(string $text, ?string $searchBy, ?string $fields, ?string $adm, int $page, int $limit): array
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

        $response = $this->api->get('grids', $query)->arrayWithHeaders();

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

    /**
     * @param array<string> $fields
     */
    public function get(string $gridName, array $fields = []): ResponsePromise
    {
        return $this->api->get("grids/$gridName", ['fields' => $fields]);
    }
}
