<?php

namespace App\Tests\Functional;

use App\Tests\Double\FakeKeycloakClient;
use App\Tests\Support\KeycloakLoginTrait;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Garde Fetch Metadata des routes d'API : 403 pour un autre site ou une navigation, repli sur X-Requested-With sans ces en-têtes.
 */
final class ApiFetchMetadataGuardTest extends WebTestCase
{
    use KeycloakLoginTrait;

    protected function setUp(): void
    {
        FakeKeycloakClient::reset();
    }

    /**
     * @return iterable<string, array{array<string, string>, 1?: string}>
     */
    public static function rejectedRequests(): iterable
    {
        yield 'autre site' => [['HTTP_SEC_FETCH_SITE' => 'cross-site', 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest']];
        yield 'sous-domaine' => [['HTTP_SEC_FETCH_SITE' => 'same-site', 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest']];
        yield 'navigation' => [['HTTP_SEC_FETCH_SITE' => 'same-origin', 'HTTP_SEC_FETCH_MODE' => 'navigate']];
        yield 'sans Fetch Metadata ni X-Requested-With' => [[]];
        yield 'chemin encodé' => [['HTTP_SEC_FETCH_SITE' => 'cross-site', 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'], '/%61pi/users/me'];
    }

    /** @param array<string, string> $headers */
    #[DataProvider('rejectedRequests')]
    public function testRejectedRequestAnswersForbiddenProblemJson(array $headers, string $path = '/api/users/me'): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->request('GET', self::BASE.$path, server: $headers);

        self::assertResponseStatusCodeSame(403);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');
        self::assertSame(403, $this->jsonResponse($client)['status']);
    }

    public function testSameOriginFetchPassesWithoutXRequestedWith(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->request('GET', self::BASE.'/api/users/me', server: ['HTTP_SEC_FETCH_SITE' => 'same-origin', 'HTTP_SEC_FETCH_MODE' => 'cors']);

        self::assertResponseIsSuccessful();
    }

    public function testContactFormIsGuardedLikeAnApiRoute(): void
    {
        $client = self::createClient();

        $client->request('POST', self::BASE.'/contact_us', server: ['HTTP_SEC_FETCH_SITE' => 'cross-site', 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'], content: '{}');

        self::assertResponseStatusCodeSame(403);
    }

    public function testLoginAndFilesAreOutsideTheGuard(): void
    {
        $client = self::createClient();
        $navigation = ['HTTP_SEC_FETCH_SITE' => 'none', 'HTTP_SEC_FETCH_MODE' => 'navigate'];

        $client->request('GET', self::BASE.'/login', server: $navigation);
        self::assertResponseRedirects();
        self::assertStringStartsWith('https://sso.test/', (string) $client->getResponse()->headers->get('Location'));

        // chemin vide : 404 avant tout accès au stockage
        $client->request('GET', self::BASE.'/files', server: $navigation);
        self::assertResponseStatusCodeSame(404);
    }
}
