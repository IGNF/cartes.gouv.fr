<?php

namespace App\Services\EspaceCoApi;

class CommunityLayerApiService extends BaseEspaceCoApiService
{
    /**
     * @param array<mixed> $fields
     *
     * @return array<mixed>
     */
    public function getLayers(int $communityId, ?array $fields = []): array
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->requestAll("communities/$communityId/layers", $query);
    }
}
