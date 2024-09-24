<?php

namespace App\Services;

use App\Services\EntrepotApi\CommunityApiService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

class SandboxService
{
    private ?string $sandboxCommunityId;
    private ?string $sandboxDatastoreId;

    public function __construct(
        private ParameterBagInterface $parameterBag,
        private CommunityApiService $communityApiService,
        private CacheInterface $cache,
    ) {
        $this->sandboxDatastoreId = null;

        $sandbox = $this->parameterBag->get('sandbox');
        $this->sandboxCommunityId = isset($sandbox['community_id']) ? $sandbox['community_id'] : null;

        if ($this->sandboxCommunityId) {
            // NOTE : on met en cache (24h) le datastore id seulement
            $key = "community-{$this->sandboxCommunityId}-datastore-id";
            try {
                $this->sandboxDatastoreId = $this->cache->get($key, function (ItemInterface $item): string {
                    $item->expiresAfter(86400);

                    $sandboxCommunity = $this->getSandboxCommunity($this->sandboxCommunityId);

                    return $sandboxCommunity['datastore']['_id'];
                });
            } catch (\Throwable $e) {
            }
        }
    }

    public function getProcIntegrateVectorFilesInBase(string $datastoreId): string
    {
        $apiEntrepot = $this->isSandboxDatastore($datastoreId) ? 'sandbox' : 'api_entrepot';
        $processings = $this->parameterBag->get($apiEntrepot)['processings'];

        return $processings['int_vect_files_db'];
    }

    public function getProcGeneratePyramidVector(string $datastoreId): string
    {
        $apiEntrepot = $this->isSandboxDatastore($datastoreId) ? 'sandbox' : 'api_entrepot';
        $processings = $this->parameterBag->get($apiEntrepot)['processings'];

        return $processings['create_vect_pyr'];
    }

    public function getSandboxCommunityId(): ?string
    {
        return $this->sandboxCommunityId;
    }

    public function isSandboxCommunity(string $CommunityId): bool
    {
        return null !== $this->sandboxCommunityId && $this->sandboxCommunityId === $CommunityId;
    }

    public function getSandboxDatastoreId(): ?string
    {
        return $this->sandboxDatastoreId;
    }

    public function isSandboxDatastore(string $datastoreId): bool
    {
        return null !== $this->sandboxDatastoreId && $this->sandboxDatastoreId === $datastoreId;
    }

    /**
     * Récupère la sandbox community. La réponse sera mis dans un cache de 5 mins.
     */
    private function getSandboxCommunity(string $sandboxCommunityId): array
    {
        return $this->communityApiService->get($sandboxCommunityId);
        // $key = "community-{$sandboxCommunityId}";

        // return $this->cache->get($key, function (ItemInterface $item) use ($sandboxCommunityId) {
        //     $item->expiresAfter(300);

        //     return $this->communityApiService->get($sandboxCommunityId);
        // });
    }
}
