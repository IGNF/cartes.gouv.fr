<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class LayerApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $datas
     */
    public function updateLayer(int $communityId, int $layerId, array $datas): PendingResponse
    {
        return $this->api->patch("communities/$communityId/layers/$layerId", $datas);
    }
}
