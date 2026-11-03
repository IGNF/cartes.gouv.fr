<?php

namespace App\Tests\Smoke;

use App\Exception\ApiErrorType;
use App\Security\Cookie\AuthCookieCipher;
use App\Security\Cookie\AuthCookieResponseListener;
use App\Security\State\LoginStateSerializer;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use League\OAuth2\Client\Token\AccessToken;
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
        EntrepotMockResponseFactory::reset();
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
        self::assertFalse($state['popup']);
    }

    public function testLoginFromThePopupCarriesTheFlagInTheState(): void
    {
        $client = self::createClient();
        $client->request('GET', self::BASE.'/login?popup=1');

        self::assertResponseRedirects();
        parse_str((string) parse_url((string) $client->getResponse()->headers->get('Location'), PHP_URL_QUERY), $query);
        self::assertIsString($query['state']);
        $state = self::getContainer()->get(LoginStateSerializer::class)->decode($query['state']);
        self::assertNotNull($state);
        self::assertTrue($state['popup']);
    }

    public function testPopupLoginSetsTheCookieAndRedirectsToTheCallback(): void
    {
        $client = self::createClient();
        $this->loginCheck($client, ['referer' => null, 'popup' => true]);

        self::assertResponseRedirects('/login/popup-callback');
        $cookie = $client->getResponse()->headers->getCookies()[0] ?? null;
        self::assertNotNull($cookie);
        self::assertSame(AuthCookieResponseListener::COOKIE_NAME, $cookie->getName());
        self::assertFalse($cookie->isCleared());
    }

    public function testFailedPopupLoginRedirectsToTheCallbackAndKeepsAnExistingCookie(): void
    {
        $client = self::createClient();
        $this->setCookieWithToken($client, FakeKeycloakClient::createAccessToken(3600));
        FakeKeycloakClient::failNextTokenExchange(new \UnexpectedValueException('invalid code'));
        $this->loginCheck($client, ['referer' => null, 'popup' => true]);

        self::assertResponseRedirects('/login/popup-callback');
        // aucun jeton reçu : le cookie encore valable de l’onglet d’origine n’est pas effacé
        self::assertSame([], $client->getResponse()->headers->getCookies());
    }

    public function testRefusedTokenInThePopupClearsTheCookieOfTheOpener(): void
    {
        $client = self::createClient();
        $this->setCookieWithToken($client, FakeKeycloakClient::createAccessToken(3600));
        FakeKeycloakClient::revokeSession();
        $this->loginCheck($client, ['referer' => null, 'popup' => true]);

        self::assertResponseRedirects('/login/popup-callback');
        // jeton reçu mais refusé par userinfo : la session Keycloak est en doute, le cookie partagé est effacé
        $clearedCookie = $client->getResponse()->headers->getCookies()[0] ?? null;
        self::assertNotNull($clearedCookie);
        self::assertTrue($clearedCookie->isCleared());
    }

    public function testExpiredStateStillEndsInTheCallbackWhenTheLoginWasOpenedInThePopup(): void
    {
        $client = self::createClient();
        $this->loginCheck($client, ['referer' => null, 'popup' => true], lifetime: -1);

        self::assertResponseRedirects('/login/popup-callback');
    }

    public function testForgedStateIsRejectedAsAnOrdinaryLoginFailure(): void
    {
        $client = self::createClient();
        $client->request('GET', self::BASE.'/login/check?code=fake-code&state=forged.signature');

        self::assertResponseRedirects('/publier-une-donnee?authentication_failed=1');
    }

    public function testPopupCallbackPageOnlyClosesItself(): void
    {
        $client = self::createClient();
        $client->request('GET', self::BASE.'/login/popup-callback');

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('Content-Type', 'text/html; charset=UTF-8');
        self::assertStringContainsString('no-store', (string) $client->getResponse()->headers->get('Cache-Control'));
        $html = (string) $client->getResponse()->getContent();
        self::assertStringContainsString('window.close()', $html);
        self::assertStringNotContainsString('<script src', $html);
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
        $this->setCookieWithToken($client, FakeKeycloakClient::createAccessToken(-60));

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

    public function testClosedKeycloakSessionFailsTheLoginWithoutSettingTheCookie(): void
    {
        $client = self::createClient();
        // jeton reçu, mais userinfo le refuse (compte désactivé entre-temps) : rien ne doit finir dans le cookie
        FakeKeycloakClient::revokeSession();
        $this->loginCheck($client, ['referer' => null]);

        self::assertResponseRedirects('/publier-une-donnee?authentication_failed=1');
        self::assertSame([], array_filter($client->getResponse()->headers->getCookies(), fn ($cookie) => !$cookie->isCleared()), 'aucun cookie posé avec le jeton refusé');
    }

    public function testFailedTokenExchangeKeepsAnExistingCookie(): void
    {
        $client = self::createClient();
        $this->setCookieWithToken($client, FakeKeycloakClient::createAccessToken(3600));
        FakeKeycloakClient::failNextTokenExchange(new \UnexpectedValueException('invalid code'));
        $this->loginCheck($client, ['referer' => null]);

        self::assertResponseRedirects('/publier-une-donnee?authentication_failed=1');
        // aucun jeton reçu : le cookie encore valable n’est pas effacé
        self::assertSame([], $client->getResponse()->headers->getCookies());
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
    private function loginCheck(KernelBrowser $client, array $statePayload, int $lifetime = 300): void
    {
        $state = self::getContainer()->get(LoginStateSerializer::class)->encode($statePayload, $lifetime);
        $client->request('GET', self::BASE.'/login/check?code=fake-code&state='.urlencode($state));
    }

    private function setCookieWithToken(KernelBrowser $client, AccessToken $token): void
    {
        $cipher = self::getContainer()->get(AuthCookieCipher::class);
        $client->getCookieJar()->set(new Cookie(
            AuthCookieResponseListener::COOKIE_NAME,
            $cipher->encrypt(serialize($token)),
            (string) (time() + 3600),
            '/',
            'localhost',
            true,
        ));
    }
}
