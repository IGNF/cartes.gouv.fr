<?php

namespace App\Services\EspaceCoApi;

use App\Security\KeycloakTokenManager;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class CommunityLayerApiService extends BaseEspaceCoApiService
{
    public function __construct(HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        KeycloakTokenManager $tokenManager,
    ) {
        parent::__construct($httpClient, $parameters, $filesystem, $tokenManager);
    }

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
