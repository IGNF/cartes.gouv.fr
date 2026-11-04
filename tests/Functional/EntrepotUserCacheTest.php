<?php

namespace App\Tests\Functional;

use App\Security\KeycloakTokenManager;
use App\Services\EntrepotUserCache;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * Le pool de cache de test est vidé entre deux requêtes HTTP : le cache se teste dans un seul noyau.
 */
final class EntrepotUserCacheTest extends KernelTestCase
{
    public function testTwoReadsWithinTheCacheWindowCallTheEntrepotOnce(): void
    {
        EntrepotMockResponseFactory::reset();
        self::getContainer()->get('request_stack')->push(new Request());
        self::getContainer()->get(KeycloakTokenManager::class)->setAccessToken(FakeKeycloakClient::createAccessToken());
        $cache = self::getContainer()->get(EntrepotUserCache::class);

        $cache->get(EntrepotMockResponseFactory::USER_ID);
        $cache->get(EntrepotMockResponseFactory::USER_ID);

        self::assertSame(1, EntrepotMockResponseFactory::usersMeCalls());
    }
}
