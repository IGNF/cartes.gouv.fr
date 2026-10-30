<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\ResponsePromise;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final readonly class LayerApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private ApiClient $api,
    ) {
    }

    /**
     * @param array<mixed> $datas
     */
    public function updateLayer(int $communityId, int $layerId, array $datas): ResponsePromise
    {
        return $this->api->patch("communities/$communityId/layers/$layerId", $datas);
    }
}
