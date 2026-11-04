<?php

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Utilisateur courant : identité lue dans l’ID token, profil lu dans l’Entrepôt à travers le cache serveur.
 */
final class CurrentUserTest extends WebTestCase
{
    use KeycloakLoginTrait;

    protected function setUp(): void
    {
        FakeKeycloakClient::reset();
        EntrepotMockResponseFactory::reset();
    }

    public function testApiUserMeAnswersTheThirteenKeysOfCartesUser(): void
    {
        $client = $this->loggedInClient();

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');

        self::assertResponseIsSuccessful();
        self::assertSame([
            'id' => FakeKeycloakClient::DEFAULT_RESOURCE_OWNER['sub'],
            'email' => FakeKeycloakClient::DEFAULT_RESOURCE_OWNER['email'],
            'user_name' => FakeKeycloakClient::DEFAULT_RESOURCE_OWNER['preferred_username'],
            'first_name' => FakeKeycloakClient::DEFAULT_RESOURCE_OWNER['given_name'],
            'last_name' => FakeKeycloakClient::DEFAULT_RESOURCE_OWNER['family_name'],
            'roles' => ['ROLE_USER'],
            'communities_member' => [],
            'account_creation_date' => '2026-01-01T00:00:00Z',
            'last_login_date' => '2026-10-29T08:00:00Z',
            'documents_quota' => 10,
            'documents_use' => 0,
            'keys_quota' => 10,
            'keys_use' => 0,
        ], $this->jsonResponse($client));
    }

    public function testPageUserMatchesApiUserMe(): void
    {
        $client = $this->loggedInClient();

        $crawler = $client->request('GET', self::BASE.'/publier-une-donnee');
        $pageUser = json_decode((string) $crawler->filter('#user')->attr('data-user'), true, 512, JSON_THROW_ON_ERROR);

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');

        self::assertSame($this->jsonResponse($client), $pageUser);
    }

    public function testEntrepotDownAnswers503ToLoggedInUserAndServesAnonymousPages(): void
    {
        $client = $this->loggedInClient();
        EntrepotMockResponseFactory::takeUsersMeDown();

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');
        self::assertResponseStatusCodeSame(503);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');

        $client->request('GET', self::BASE.'/publier-une-donnee');
        self::assertResponseStatusCodeSame(503);

        $client->getCookieJar()->clear();
        $client->request('GET', self::BASE.'/publier-une-donnee');
        self::assertResponseIsSuccessful();
    }

    public function testProfileOfAnotherUserIsRejected(): void
    {
        $client = $this->loggedInClient();
        EntrepotMockResponseFactory::answerUsersMeFor('another-user');

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');

        self::assertResponseStatusCodeSame(500);
    }

    private function loggedInClient(): KernelBrowser
    {
        $client = self::createClient();
        $this->logIn($client);

        return $client;
    }
}
