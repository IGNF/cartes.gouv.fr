<?php

namespace App\Services;

use App\ApiClient\ApiClient;
use App\ApiClient\Auth\ServiceAccountAuthenticationException;
use App\Exception\ApiException;
use App\Exception\SandboxUnavailableException;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

class SandboxService
{
    private ?string $sandboxCommunityId;
    private ?string $sandboxDatastoreId = null;

    public function __construct(
        private ParameterBagInterface $parameterBag,
        // compte de service : la communauté sandbox est une configuration de l'application, pas un droit de l'utilisateur
        #[Autowire(service: 'app.api_client.entrepot_sandbox_service_account')]
        private ApiClient $serviceAccountApi,
        private CacheInterface $cache,
        private LoggerInterface $logger,
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

    /** null si le bac à sable n'est pas configuré */
    public function getSandboxCommunityId(): ?string
    {
        return $this->sandboxCommunityId;
    }

    /**
     * @throws SandboxUnavailableException
     */
    public function isSandboxDatastore(string $datastoreId): bool
    {
        return $this->getSandboxDatastoreId() === $datastoreId;
    }

    /**
     * Sonde de readiness : no-op si le bac à sable n'est pas configuré.
     *
     * @throws SandboxUnavailableException
     */
    public function assertAvailable(): void
    {
        $this->getSandboxDatastoreId();
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
     * Résolu au premier besoin, pas au constructeur : la communauté sandbox est la même pour tous.
     * Un échec (SandboxUnavailableException) n'est pas mis en cache : la prochaine requête réessaie, le pod reste non prêt tant que le problème dure.
     */
    private function getSandboxDatastoreId(): ?string
    {
        if (null === $this->sandboxCommunityId) {
            return null;
        }

        return $this->sandboxDatastoreId ??= $this->cache->get("community-{$this->sandboxCommunityId}-datastore-id", function (ItemInterface $item): string {
            $item->expiresAfter(86400);

            try {
                $community = $this->serviceAccountApi->get("communities/{$this->sandboxCommunityId}")->array();
            } catch (ApiException|ServiceAccountAuthenticationException $e) {
                $this->logger->error('Communauté sandbox {communityId} injoignable : {error}', ['communityId' => $this->sandboxCommunityId, 'error' => $e->getMessage(), 'exception' => $e]);

                throw new SandboxUnavailableException($e->getMessage(), $e);
            }

            return $community['datastore']['_id']
                ?? throw new SandboxUnavailableException("La communauté sandbox {$this->sandboxCommunityId} n'a pas de datastore");
        });
    }
}
