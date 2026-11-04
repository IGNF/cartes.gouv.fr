<?php

namespace App\Tests\Functional;

use App\Tests\Double\FakeKeycloakClient;
use App\Tests\Support\KeycloakLoginTrait;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ApiGuardTest extends WebTestCase
{
    use KeycloakLoginTrait;

    protected function setUp(): void
    {
        FakeKeycloakClient::reset();
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public static function requestsWithoutXRequestedWith(): iterable
    {
        yield 'lecture' => ['GET', '/api/users/me'];
        yield 'chemin encodé' => ['GET', '/%61pi/users/me'];
        yield 'écriture' => ['POST', '/api/contact/join_community'];
    }

    #[DataProvider('requestsWithoutXRequestedWith')]
    public function testRequestWithoutXRequestedWithAnswersForbiddenProblemJson(string $method, string $path): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->request($method, self::BASE.$path);

        self::assertResponseStatusCodeSame(403);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');
        self::assertSame(403, $this->jsonResponse($client)['status']);
    }

    // la garde passe avant le pare-feu : un onglet ne distingue pas un visiteur anonyme d'un connecté
    public function testAnonymousRequestWithoutXRequestedWithAnswersForbiddenNotUnauthorized(): void
    {
        $client = self::createClient();

        $client->request('GET', self::BASE.'/api/users/me');

        self::assertResponseStatusCodeSame(403);
    }

    public function testRequestWithXRequestedWithPasses(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');

        self::assertResponseIsSuccessful();
    }

    public function testContactFormIsGuardedLikeAnApiRoute(): void
    {
        $client = self::createClient();

        $client->request('POST', self::BASE.'/contact_us', content: '{}');

        self::assertResponseStatusCodeSame(403);
    }

    public function testApiDocLoginAndFilesAreOutsideTheGuard(): void
    {
        $client = self::createClient();

        $client->request('GET', self::BASE.'/api/doc');
        self::assertResponseIsSuccessful();

        $client->request('GET', self::BASE.'/login');
        self::assertResponseRedirects();
        self::assertStringStartsWith('https://sso.test/', (string) $client->getResponse()->headers->get('Location'));

        // chemin vide : 404 avant tout accès au stockage
        $client->request('GET', self::BASE.'/files');
        self::assertResponseStatusCodeSame(404);
    }
}
