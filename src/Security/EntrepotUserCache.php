<?php

namespace App\Security;

use App\Services\EntrepotApi\UserApiService;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

/**
 * Cache serveur de la réponse GET users/me de l'API Entrepôt, clé par identifiant Keycloak.
 */
class EntrepotUserCache
{
    private const CACHE_KEY_PREFIX = 'user-me-';
    private const TTL = 60;
    private const REFRESH_THROTTLE = 10;

    public function __construct(
        private UserApiService $userApiService,
        private CacheInterface $cache,
    ) {
    }

    /**
     * @return array<mixed>
     */
    public function get(string $keycloakId): array
    {
        return $this->doGet($keycloakId)['data'];
    }

    /**
     * Recalcule l'entrée immédiatement, sans la supprimer (garde la protection contre les recalculs concurrents).
     *
     * @return array<mixed>
     */
    public function refresh(string $keycloakId): array
    {
        return $this->doGet($keycloakId, INF)['data'];
    }

    /**
     * @return array<mixed>
     */
    public function refreshThrottled(string $keycloakId): array
    {
        $entry = $this->doGet($keycloakId);

        if (time() - $entry['fetched_at'] < self::REFRESH_THROTTLE) {
            return $entry['data'];
        }

        return $this->refresh($keycloakId);
    }

    public function invalidate(string $keycloakId): void
    {
        $this->cache->delete(self::CACHE_KEY_PREFIX.$keycloakId);
    }

    /**
     * @return array{fetched_at:int,data:array<mixed>}
     */
    private function doGet(string $keycloakId, ?float $beta = null): array
    {
        return $this->cache->get(self::CACHE_KEY_PREFIX.$keycloakId, function (ItemInterface $item) {
            $item->expiresAfter(self::TTL);
            $data = $this->userApiService->getMe()->array();

            return ['fetched_at' => time(), 'data' => $data];
        }, $beta);
    }
}
