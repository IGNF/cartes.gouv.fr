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

    public function testFailedPopupLoginRedirectsToTheCallback(): void
    {
        $client = self::createClient();
        FakeKeycloakClient::failNextTokenExchange(new \UnexpectedValueException('invalid code'));
        $this->loginCheck($client, ['referer' => null, 'popup' => true]);

        self::assertResponseRedirects('/login/popup-callback');
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
        self::assertSame(EntrepotMockResponseFactory::USER_ID, $user['id']);
    }

    public function testExpiredTokenInCookieAnswersJsonUnauthorizedAndClearsTheCookie(): void
    {
        $client = self::createClient();
        $this->setExpiredTokenCookie($client);

        $client->xmlHttpRequest('GET', self::BASE.'/api/users/me');

        self::assertResponseStatusCodeSame(401);
        $body = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame(ApiErrorType::ANONYMOUS, $body['type']);

        $clearedCookie = $client->getResponse()->headers->getCookies()[0] ?? null;
        self::assertNotNull($clearedCookie, 'la réponse doit effacer le cookie');
        self::assertSame(AuthCookieResponseListener::COOKIE_NAME, $clearedCookie->getName());
        self::assertTrue($clearedCookie->isCleared());
    }

    public function testExpiredTokenInCookieOnAPageRedirectsToLogin(): void
    {
        $client = self::createClient();
        $this->setExpiredTokenCookie($client);

        $client->request('GET', self::BASE.'/tableau-de-bord');

        self::assertResponseRedirects('/login');
    }

    public function testLoginKeepsOnlyASameOriginReferer(): void
    {
        $client = self::createClient();
        foreach (['https://localhost.evil.test/page' => null, 'https://localhost@evil.test/page' => null, self::BASE.'/catalogue' => self::BASE.'/catalogue'] as $referer => $expected) {
            $client->request('GET', self::BASE.'/login', server: ['HTTP_REFERER' => $referer]);

            parse_str((string) parse_url((string) $client->getResponse()->headers->get('Location'), PHP_URL_QUERY), $query);
            self::assertIsString($query['state']);
            $state = self::getContainer()->get(LoginStateSerializer::class)->decode($query['state']);
            self::assertNotNull($state);
            self::assertSame($expected, $state['referer'], $referer);
        }
    }

    public function testSuccessfulLoginReturnsToTheRefererPage(): void
    {
        $client = self::createClient();
        // la requête est gardée telle quelle : le front n’affiche l’alerte d’échec qu’aux visiteurs anonymes
        $this->loginCheck($client, ['referer' => self::BASE.'/publier-une-donnee?login_failed=1']);

        self::assertResponseRedirects(self::BASE.'/publier-une-donnee?login_failed=1');
    }

    public function testSuccessfulLoginIgnoresAForeignRefererInTheState(): void
    {
        $client = self::createClient();
        $this->loginCheck($client, ['referer' => 'https://evil.test/']);

        self::assertResponseRedirects(self::BASE.'/');
    }

    public function testSignupIsNoLongerARoute(): void
    {
        $client = self::createClient();
        $client->request('GET', self::BASE.'/signup');

        // servie par l’application React, qui affiche sa page « introuvable »
        self::assertResponseIsSuccessful();
        self::assertSame('cartesgouvfr_app', $client->getRequest()->attributes->get('_route'));
    }

    public function testFailedTokenExchangeRedirectsToPublishPage(): void
    {
        $client = self::createClient();
        FakeKeycloakClient::failNextTokenExchange(new \UnexpectedValueException('invalid code'));
        $this->loginCheck($client, ['referer' => null]);

        self::assertResponseRedirects('/publier-une-donnee?login_failed=1');
    }

    public function testIncompleteIdTokenAtLoginRedirectsToPublishPageWithoutCookie(): void
    {
        $client = self::createClient();
        FakeKeycloakClient::issueIdTokenWithout('email');
        $this->loginCheck($client, ['referer' => null]);

        self::assertResponseRedirects('/publier-une-donnee?login_failed=1');
        foreach ($client->getResponse()->headers->getCookies() as $cookie) {
            self::assertTrue(AuthCookieResponseListener::COOKIE_NAME !== $cookie->getName() || $cookie->isCleared(), 'aucun cookie d’authentification ne doit être posé');
        }
    }

    // ne peut venir que d’un cookie antérieur à la vérification au login : 500, pas de redirection vers le login
    public function testIncompleteIdTokenInCookieAnswersServerErrorWithoutRedirect(): void
    {
        $client = self::createClient();
        FakeKeycloakClient::issueIdTokenWithout('sub');
        $cipher = self::getContainer()->get(AuthCookieCipher::class);
        $client->getCookieJar()->set(new Cookie(
            AuthCookieResponseListener::COOKIE_NAME,
            $cipher->encrypt(serialize(FakeKeycloakClient::createAccessToken())),
            (string) (time() + 3600),
            '/',
            'localhost',
            true,
        ));

        $client->request('GET', self::BASE.'/publier-une-donnee');

        self::assertResponseStatusCodeSame(500);
    }

    public function testLogoutRedirectsToPublishPage(): void
    {
        $client = self::createClient();
        $client->request('GET', self::BASE.'/logout');

        self::assertResponseRedirects(self::BASE.'/publier-une-donnee');
    }

    // le cookie est posé avec une expiration navigateur future : seul le jeton qu’il contient est expiré
    private function setExpiredTokenCookie(KernelBrowser $client): void
    {
        $cipher = self::getContainer()->get(AuthCookieCipher::class);
        $client->getCookieJar()->set(new Cookie(
            AuthCookieResponseListener::COOKIE_NAME,
            $cipher->encrypt(serialize(FakeKeycloakClient::createAccessToken(-60))),
            (string) (time() + 3600),
            '/',
            'localhost',
            true,
        ));
    }

    /** @param array<string, mixed> $statePayload */
    private function loginCheck(KernelBrowser $client, array $statePayload): void
    {
        $state = self::getContainer()->get(LoginStateSerializer::class)->encode($statePayload);
        $client->request('GET', self::BASE.'/login/check?code=fake-code&state='.urlencode($state));
    }
}
