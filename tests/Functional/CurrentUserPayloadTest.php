<?php

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Charge utilisateur : une seule construction pour la page et pour l’API, panne Entrepôt propagée sans casser l’authentification.
 */
final class CurrentUserPayloadTest extends WebTestCase
{
    use KeycloakLoginTrait;

    protected function setUp(): void
    {
        FakeKeycloakClient::reset();
        EntrepotMockResponseFactory::reset();
    }

    // les doubles sont statiques : rien ne doit fuir vers la classe de test suivante
    protected function tearDown(): void
    {
        EntrepotMockResponseFactory::reset();
        parent::tearDown();
    }

    public function testPageBootstrapEqualsApiPayload(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');
        $apiPayload = $this->jsonResponse($client);

        $client->request('GET', self::BASE.'/publier-une-donnee');

        self::assertResponseIsSuccessful();
        $bootstrap = json_decode((string) $client->getCrawler()->filter('#user')->attr('data-user'), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame($apiPayload, $bootstrap);
        self::assertSame(EntrepotMockResponseFactory::USER_ID, $bootstrap['_id']);
        self::assertSame('test@example.com', $bootstrap['email']);
    }

    public function testEntrepotOutageAnswersServiceUnavailableButKeepsAuthentication(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        EntrepotMockResponseFactory::failUsersMe();

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');

        self::assertResponseStatusCodeSame(503);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');
        // l’authentification a réussi : le cookie n’est pas effacé
        self::assertSame([], $client->getResponse()->headers->getCookies());
    }

    public function testEntrepotIdDifferentFromKeycloakSubIsRefused(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        EntrepotMockResponseFactory::answerUsersMeWithId('autre-utilisateur');

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');

        self::assertResponseStatusCodeSame(500);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');
    }

    public function testAnonymousPageIsServedWithoutUpstreamEvenDuringAnOutage(): void
    {
        $client = self::createClient();
        EntrepotMockResponseFactory::failUsersMe();

        $client->request('GET', self::BASE.'/publier-une-donnee');

        self::assertResponseIsSuccessful();
        self::assertSelectorNotExists('#user');
        self::assertSame(0, EntrepotMockResponseFactory::usersMeCalls());
    }
}
