<?php

namespace App\Tests\Functional;

use App\Security\KeycloakTokenManager;
use App\Security\KeycloakUserProvider;
use App\Tests\Double\FakeKeycloakClient;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Vivacité de la session Keycloak : un appel userinfo par jeton et par minute, l’identité vient de l’ID token.
 */
final class KeycloakSessionCheckTest extends KernelTestCase
{
    protected function setUp(): void
    {
        FakeKeycloakClient::reset();
        self::bootKernel();
        self::getContainer()->get(RequestStack::class)->push(new Request());
        self::getContainer()->get(KeycloakTokenManager::class)->setAccessToken(FakeKeycloakClient::createAccessToken());
    }

    protected function tearDown(): void
    {
        FakeKeycloakClient::reset();
        parent::tearDown();
    }

    public function testSecondLoadWithinTheTtlCallsKeycloakOnce(): void
    {
        $provider = self::getContainer()->get(KeycloakUserProvider::class);

        $first = $provider->loadUser();
        $second = $provider->loadUser();

        self::assertSame(FakeKeycloakClient::ID_TOKEN_CLAIMS['sub'], $first->getId());
        self::assertSame($first->getEmail(), $second->getEmail());
        self::assertSame(1, FakeKeycloakClient::userInfoCalls());
    }
}
