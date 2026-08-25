<?php

namespace App\Services;

use App\Services\EntrepotApi\CommunityApiService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

class SandboxService
{
    private ?string $sandboxCommunityId;
    private ?string $sandboxDatastoreId = null;

    public function __construct(
        private ParameterBagInterface $parameterBag,
        private CommunityApiService $communityApiService,
        private CacheInterface $cache,
    ) {
        // id vide dans la config par défaut : bac à sable non configuré
        $this->sandboxCommunityId = ($this->parameterBag->get('sandbox')['community_id'] ?? null) ?: null;
    }

    public function getProcIntegrateVectorFilesInBase(string $datastoreId): string
    {
        return $this->getProcessings($datastoreId)['int_vect_files_db'];
    }

    public function getProcGeneratePyramidVector(string $datastoreId): string
    {
        return $this->getProcessings($datastoreId)['create_vect_pyr'];
    }

    public function getProcGeneratePyramidRaster(string $datastoreId): string
    {
        return $this->getProcessings($datastoreId)['create_rast_pyr'];
    }

    public function isSandboxDatastore(string $datastoreId): bool
    {
        $sandboxDatastoreId = $this->getSandboxDatastoreId();

        return null !== $sandboxDatastoreId && $sandboxDatastoreId === $datastoreId;
    }

    /**
     * @return array<string,string>
     */
    private function getProcessings(string $datastoreId): array
    {
        $apiEntrepot = $this->isSandboxDatastore($datastoreId) ? 'sandbox' : 'api_entrepot';

        return $this->parameterBag->get($apiEntrepot)['processings'];
    }

    /**
     * Résolu au premier besoin (pas au constructeur) : la communauté sandbox est la même pour tous, cache serveur 24 h.
     */
    private function getSandboxDatastoreId(): ?string
    {
        if (null === $this->sandboxCommunityId) {
            return null;
        }

        return $this->sandboxDatastoreId ??= $this->cache->get("community-{$this->sandboxCommunityId}-datastore-id", function (ItemInterface $item): ?string {
            $item->expiresAfter(86400);

            return $this->communityApiService->get($this->sandboxCommunityId)->array()['datastore']['_id'] ?? null;
        });
    }
}
