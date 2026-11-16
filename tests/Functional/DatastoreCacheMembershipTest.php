<?php

namespace App\Tests\Functional;

use App\Controller\Entrepot\DatastoreController;
use App\Exception\ApiException;
use App\Security\KeycloakTokenManager;
use App\Security\User;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\MembershipService;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

/**
 * Le cache de l’entrepôt est commun à tous les utilisateurs : les routes qui renvoient l’entrepôt ne le lisent pas.
 * Le pool de cache de test est vidé entre deux requêtes HTTP : le cache se teste dans un seul noyau.
 */
final class DatastoreCacheMembershipTest extends KernelTestCase
{
    private const ID = EntrepotMockResponseFactory::DATASTORE_ID;

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        self::getContainer()->get('request_stack')->push(new Request());
        self::getContainer()->get(KeycloakTokenManager::class)->setAccessToken(FakeKeycloakClient::createAccessToken());
        $user = new User(EntrepotMockResponseFactory::USER_ID, 'test@example.test', 'test');
        self::getContainer()->get('security.token_storage')->setToken(new UsernamePasswordToken($user, 'main', $user->getRoles()));
    }

    public function testTheRoutesDoNotReadTheCacheEvenForAMember(): void
    {
        EntrepotMockResponseFactory::makeUserMemberOfDatastore();
        $this->warmCache();

        $controller = self::getContainer()->get(DatastoreController::class);
        self::assertSame(Response::HTTP_OK, $controller->getDatastore(self::ID)->getStatusCode());
        self::assertSame(Response::HTTP_OK, $controller->getEndpoints(self::ID)->getStatusCode());

        self::assertSame(3, EntrepotMockResponseFactory::datastoreCalls());
    }

    public function testANonMemberGetsTheAnswerOfTheEntrepotForTheDatastore(): void
    {
        $this->warmCache();
        EntrepotMockResponseFactory::forbidDatastore();

        $this->assertForbidden(fn () => self::getContainer()->get(DatastoreController::class)->getDatastore(self::ID));
        self::assertSame(2, EntrepotMockResponseFactory::datastoreCalls());
    }

    public function testANonMemberGetsTheAnswerOfTheEntrepotForTheEndpoints(): void
    {
        $this->warmCache();
        EntrepotMockResponseFactory::forbidDatastore();

        $this->assertForbidden(fn () => self::getContainer()->get(DatastoreController::class)->getEndpoints(self::ID));
        self::assertSame(2, EntrepotMockResponseFactory::datastoreCalls());
    }

    public function testANonMemberGetsTheAnswerOfTheEntrepotForTheIdentity(): void
    {
        $this->warmCache();
        EntrepotMockResponseFactory::forbidDatastore();

        $this->assertForbidden(fn () => self::getContainer()->get(MembershipService::class)->getDatastoreIdentity(self::ID));
        self::assertSame(2, EntrepotMockResponseFactory::datastoreCalls());
    }

    // un autre utilisateur, membre, vient de charger l’entrepôt
    private function warmCache(): void
    {
        self::getContainer()->get(DatastoreApiService::class)->get(self::ID);
        self::assertSame(1, EntrepotMockResponseFactory::datastoreCalls());
    }

    private function assertForbidden(callable $call): void
    {
        try {
            $call();
            self::fail('Réponse servie sans interroger l’Entrepôt');
        } catch (ApiException $e) {
            self::assertSame(Response::HTTP_FORBIDDEN, $e->getCode());
        }
    }
}
