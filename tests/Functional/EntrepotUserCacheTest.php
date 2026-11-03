<?php

namespace App\Tests\Functional;

use App\Security\KeycloakTokenManager;
use App\Services\EntrepotUserCache;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Le profil Entrepôt est servi par le cache serveur : un seul appel amont par TTL, sauf rafraîchissement explicite.
 * Hors client HTTP : celui-ci redémarre le noyau et vide le cache entre deux requêtes.
 */
final class EntrepotUserCacheTest extends KernelTestCase
{
    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        self::bootKernel();

        // le client Entrepôt lit le jeton de la requête courante
        self::getContainer()->get(RequestStack::class)->push(new Request());
        self::getContainer()->get(KeycloakTokenManager::class)->setAccessToken(FakeKeycloakClient::createAccessToken());
    }

    public function testSecondReadIsServedByTheCache(): void
    {
        $cache = self::getContainer()->get(EntrepotUserCache::class);
        $sub = FakeKeycloakClient::ID_TOKEN_CLAIMS['sub'];

        $first = $cache->get($sub);
        $second = $cache->get($sub);

        self::assertSame($first, $second);
        self::assertSame(EntrepotMockResponseFactory::USER_ID, $first['_id']);
        self::assertSame(1, EntrepotMockResponseFactory::usersMeCalls());
    }

    public function testRefreshCallsUpstreamAgain(): void
    {
        $cache = self::getContainer()->get(EntrepotUserCache::class);
        $sub = FakeKeycloakClient::ID_TOKEN_CLAIMS['sub'];

        $cache->get($sub);
        // le rafraîchissement n’est pas rejoué dans la requête qui vient de calculer l’entrée : requête suivante simulée
        $cache->reset();
        $cache->refresh($sub);

        self::assertSame(2, EntrepotMockResponseFactory::usersMeCalls());
    }
}
