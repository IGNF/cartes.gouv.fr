<?php

namespace App\Services\EspaceCoApi;

class LayerApiService extends BaseEspaceCoApiService
{
    /**
     * @param array<mixed> $datas
     */
    public function updateLayer(int $communityId, int $layerId, array $datas): array
    {
        return $this->request('PATCH', "communities/$communityId/layers/$layerId", $datas);
    }
}
