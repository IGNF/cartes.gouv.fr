<?php

namespace App\Tests\Smoke;

use App\Exception\ApiErrorType;
use App\Security\Cookie\AuthCookieCipher;
use App\Security\Cookie\AuthCookieResponseListener;
use App\Security\State\LoginStateSerializer;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\BrowserKit\Cookie;

/**
 * Flux complet login / cookie / API / logout, Keycloak et Entrepôt doublés.
 * Les URL sont en https : le cookie est Secure, le navigateur de test ne le renvoie qu’en https.
 */
final class AuthenticationFlowTest extends WebTestCase
{
    private const BASE = 'https://localhost';

    protected function setUp(): void
    {
        FakeKeycloakClient::reset();
    }

    public function testLoginRedirectsToKeycloakWithSignedState(): void
    {
        $client = self::createClient();
        $client->request('GET', self::BASE.'/login', server: ['HTTP_REFERER' => self::BASE.'/tableau-de-bord']);

        self::assertResponseRedirects();
        $location = (string) $client->getResponse()->headers->get('Location');
        self::assertStringStartsWith('https://sso.test/realms/test/protocol/openid-connect/auth?', $location);

        parse_str((string) parse_url($location, PHP_URL_QUERY), $query);
        self::assertSame('cartes-gouv-test', $query['client_id']);
        self::assertSame(self::BASE.'/login/check', $query['redirect_uri']);

        self::assertIsString($query['state']);
        $state = self::getContainer()->get(LoginStateSerializer::class)->decode($query['state']);
        self::assertNotNull($state);
        self::assertSame(self::BASE.'/tableau-de-bord', $state['referer']);
    }

    public function testSuccessfulLoginSetsTheCookieAndAuthenticatesApiCalls(): void
    {
        $client = self::createClient();
        $before = time();
        $this->loginCheck($client, ['referer' => null]);

        self::assertResponseRedirects(self::BASE.'/');
        $cookie = $client->getResponse()->headers->getCookies()[0] ?? null;
        self::assertNotNull($cookie);
        self::assertSame(AuthCookieResponseListener::COOKIE_NAME, $cookie->getName());
        self::assertTrue($cookie->isSecure());
        self::assertTrue($cookie->isHttpOnly());

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');

        self::assertResponseIsSuccessful();
        $user = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame('test@example.com', $user['email']);
        self::assertSame('test', $user['user_name']);
        self::assertSame(EntrepotMockResponseFactory::USER_ID, $user['_id']);
        self::assertSame([], $user['communities_member']);
        // expiration du jeton posé par le double (3600 s), en secondes Unix
        self::assertGreaterThanOrEqual($before + 3600, $user['session_expires_at']);
        self::assertLessThanOrEqual(time() + 3600, $user['session_expires_at']);
    }

    public function testExpiredTokenInCookieAnswersJsonUnauthorizedAndClearsTheCookie(): void
    {
        $client = self::createClient();
        // le cookie est posé avec une expiration navigateur future : seul le jeton qu’il contient est expiré
        $expiredToken = FakeKeycloakClient::createAccessToken(-60);
        $cipher = self::getContainer()->get(AuthCookieCipher::class);
        $client->getCookieJar()->set(new Cookie(
            AuthCookieResponseListener::COOKIE_NAME,
            $cipher->encrypt(serialize($expiredToken)),
            (string) (time() + 3600),
            '/',
            'localhost',
            true,
        ));

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');

        self::assertResponseStatusCodeSame(401);
        $body = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame(ApiErrorType::ANONYMOUS, $body['type']);

        $clearedCookie = $client->getResponse()->headers->getCookies()[0] ?? null;
        self::assertNotNull($clearedCookie, 'la réponse doit effacer le cookie');
        self::assertSame(AuthCookieResponseListener::COOKIE_NAME, $clearedCookie->getName());
        self::assertTrue($clearedCookie->isCleared());
    }

    public function testRevokedKeycloakSessionAnswersUnauthorizedAndClearsTheCookie(): void
    {
        $client = self::createClient();
        $this->loginCheck($client, ['referer' => null]);
        FakeKeycloakClient::revokeSession();

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');

        self::assertResponseStatusCodeSame(401);
        $clearedCookie = $client->getResponse()->headers->getCookies()[0] ?? null;
        self::assertNotNull($clearedCookie);
        self::assertTrue($clearedCookie->isCleared());
    }

    public function testUnreadableIdTokenFailsTheLoginWithoutSettingTheCookie(): void
    {
        $client = self::createClient();
        FakeKeycloakClient::useIdTokenClaims(['sub' => 'kc-user-1']);
        $this->loginCheck($client, ['referer' => null]);

        self::assertResponseRedirects('/publier-une-donnee?authentication_failed=1');
        self::assertSame([], array_filter($client->getResponse()->headers->getCookies(), fn ($cookie) => !$cookie->isCleared()), 'aucun cookie posé avec le jeton refusé');
    }

    public function testFailedTokenExchangeRedirectsToPublishPage(): void
    {
        $client = self::createClient();
        FakeKeycloakClient::failNextTokenExchange(new \UnexpectedValueException('invalid code'));
        $this->loginCheck($client, ['referer' => null]);

        self::assertResponseRedirects('/publier-une-donnee?authentication_failed=1');
    }

    public function testLogoutRedirectsToPublishPage(): void
    {
        $client = self::createClient();
        $client->request('GET', self::BASE.'/logout');

        self::assertResponseRedirects(self::BASE.'/publier-une-donnee');
    }

    /** @param array<string, mixed> $statePayload */
    private function loginCheck(KernelBrowser $client, array $statePayload): void
    {
        $state = self::getContainer()->get(LoginStateSerializer::class)->encode($statePayload);
        $client->request('GET', self::BASE.'/login/check?code=fake-code&state='.urlencode($state));
    }
}
