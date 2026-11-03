<?php

namespace App\Tests\Functional;

use App\Security\KeycloakTokenManager;
use App\Security\KeycloakUserProvider;
use App\Services\EntrepotUserCache;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Caches serveur des réponses amont : userinfo Keycloak (identité et vivacité) et GET users/me Entrepôt, un appel par TTL.
 * Hors client HTTP : celui-ci redémarre le noyau et vide le cache entre deux requêtes.
 */
final class UpstreamCachesTest extends KernelTestCase
{
    protected function setUp(): void
    {
        FakeKeycloakClient::reset();
        EntrepotMockResponseFactory::reset();
        self::bootKernel();

        // les clients amont lisent le jeton de la requête courante
        self::getContainer()->get(RequestStack::class)->push(new Request());
        self::getContainer()->get(KeycloakTokenManager::class)->setAccessToken(FakeKeycloakClient::createAccessToken());
    }

    protected function tearDown(): void
    {
        FakeKeycloakClient::reset();
        EntrepotMockResponseFactory::reset();
        parent::tearDown();
    }

    public function testSecondUserLoadWithinTheTtlCallsKeycloakOnce(): void
    {
        $provider = self::getContainer()->get(KeycloakUserProvider::class);

        $first = $provider->loadUser();
        $second = $provider->loadUser();

        self::assertSame(FakeKeycloakClient::USER_INFO['sub'], $first->getId());
        self::assertSame($first->getEmail(), $second->getEmail());
        self::assertSame(1, FakeKeycloakClient::userInfoCalls());
    }

    public function testSecondProfileReadIsServedByTheCache(): void
    {
        $cache = self::getContainer()->get(EntrepotUserCache::class);
        $sub = FakeKeycloakClient::USER_INFO['sub'];

        $first = $cache->get($sub);
        $second = $cache->get($sub);

        self::assertSame($first, $second);
        self::assertSame(EntrepotMockResponseFactory::USER_ID, $first['_id']);
        self::assertSame(1, EntrepotMockResponseFactory::usersMeCalls());
    }

    public function testProfileRefreshCallsUpstreamAgain(): void
    {
        $cache = self::getContainer()->get(EntrepotUserCache::class);
        $sub = FakeKeycloakClient::USER_INFO['sub'];

        $cache->get($sub);
        // le rafraîchissement n’est pas rejoué dans la requête qui vient de calculer l’entrée : requête suivante simulée
        $cache->reset();
        $cache->refresh($sub);

        self::assertSame(2, EntrepotMockResponseFactory::usersMeCalls());
    }
}
