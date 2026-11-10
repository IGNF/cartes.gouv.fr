<?php

namespace App\Tests\Functional;

use App\Security\ApiAuthenticationEntryPoint;
use App\Tests\Double\FakeKeycloakClient;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Mime\RawMessage;

/**
 * Formulaires de contact : courriels envoyés au destinataire et accusé de réception (transport null, voir phpunit.dist.xml).
 */
final class ContactFormTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const SUPPORT_EMAIL = 'support@example.test';
    private const USER_EMAIL = FakeKeycloakClient::DEFAULT_RESOURCE_OWNER['email'];

    public function testContactUsMailsSupportAndAcknowledgesTheVisitor(): void
    {
        $client = self::createClient();

        $client->xmlHttpRequest('POST', self::BASE.'/contact_us', content: $this->json([
            'email_contact' => 'visiteur@example.test',
            'importance' => '0',
            'message' => 'Bonjour, une question.',
            'first_name' => 'Prénom',
            'last_name' => 'Nom',
            'category' => 'Autre',
            'organization' => 'Organisation test',
        ]));

        self::assertResponseIsSuccessful();
        self::assertEmailCount(2);
        self::assertEmailAddressContains($this->sentEmail(0), 'To', self::SUPPORT_EMAIL);
        self::assertEmailHtmlBodyContains($this->sentEmail(0), 'Bonjour, une question.');
        self::assertEmailAddressContains($this->sentEmail(1), 'To', 'visiteur@example.test');
    }

    public function testContactUsIgnoresTheHoneypotSilently(): void
    {
        $client = self::createClient();

        $client->xmlHttpRequest('POST', self::BASE.'/contact_us', content: $this->json([
            'email_contact' => 'robot@example.test',
            'importance' => '1',
            'message' => 'spam',
        ]));

        self::assertResponseIsSuccessful();
        self::assertEmailCount(0);
    }

    public function testContactUsRefusesTheSixthCallFromTheSameIpWithin10Minutes(): void
    {
        // hors débogage : le corps d’erreur ne doit exposer ni classe ni pile d’appels
        $client = self::createClient(['debug' => false]);
        // le compteur vit dans le cache du noyau : pas de redémarrage entre deux requêtes
        $client->disableReboot();
        $honeypot = $this->json(['importance' => '1']);

        for ($i = 1; $i <= 5; ++$i) {
            $client->xmlHttpRequest('POST', self::BASE.'/contact_us', content: $honeypot);
            self::assertResponseIsSuccessful("appel n° {$i}");
        }

        $client->xmlHttpRequest('POST', self::BASE.'/contact_us', content: $honeypot);

        self::assertResponseStatusCodeSame(429);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertGreaterThan(0, (int) $client->getResponse()->headers->get('Retry-After'));
        $body = $this->jsonResponse($client);
        self::assertSame('Trop de demandes, réessayez plus tard', $body['detail']);
        self::assertArrayNotHasKey('class', $body);
        self::assertArrayNotHasKey('trace', $body);

        $client->xmlHttpRequest('POST', self::BASE.'/contact_us', server: ['REMOTE_ADDR' => '192.0.2.10'], content: $honeypot);
        self::assertResponseIsSuccessful();
    }

    public function testContactUsRejectsAnInvalidEmail(): void
    {
        $client = self::createClient();

        $client->xmlHttpRequest('POST', self::BASE.'/contact_us', content: $this->json([
            'email_contact' => 'pas-une-adresse',
            'importance' => '0',
            'message' => 'x',
            'first_name' => 'Prénom',
            'last_name' => 'Nom',
            'category' => 'Autre',
            'organization' => 'Organisation test',
        ]));

        self::assertResponseStatusCodeSame(400);
        self::assertEmailCount(0);
    }

    public function testDatastoreCreateRequestMailsSupportAndTheUser(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::BASE.'/api/contact/datastore_create_request', content: $this->json([
            'name' => 'Entrepôt test',
            'technical_name' => 'entrepot_test',
            'offer' => 'standard',
            'information' => 'Projet test',
        ]));

        self::assertResponseIsSuccessful();
        self::assertEmailCount(2);
        self::assertEmailAddressContains($this->sentEmail(0), 'To', self::SUPPORT_EMAIL);
        self::assertEmailHtmlBodyContains($this->sentEmail(0), 'entrepot_test');
        self::assertEmailAddressContains($this->sentEmail(1), 'To', self::USER_EMAIL);
    }

    public function testDatastoreCreateRequestRefusesAnAnonymousVisitor(): void
    {
        $client = self::createClient();

        $client->xmlHttpRequest('POST', self::BASE.'/api/contact/datastore_create_request', content: $this->json(['name' => 'Entrepôt test']));

        self::assertResponseStatusCodeSame(401);
        // refusé par le pare-feu, avant le contrôleur
        self::assertSame(ApiAuthenticationEntryPoint::DETAIL, $this->jsonResponse($client)['detail']);
        self::assertEmailCount(0);
    }

    public function testJoinCommunityMailsTheCommunityContactAndTheUser(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::BASE.'/api/contact/join_community', content: $this->json([
            'community' => ['_id' => 'community-1', 'name' => 'Communauté test', 'contact' => 'gestion@example.test'],
            'other_info' => ['Motif' => 'Projet test'],
        ]));

        self::assertResponseStatusCodeSame(204);
        self::assertEmailCount(2);
        self::assertEmailAddressContains($this->sentEmail(0), 'To', 'gestion@example.test');
        self::assertEmailAddressContains($this->sentEmail(1), 'To', self::USER_EMAIL);
    }

    public function testAccessesRequestMailsTheProducerWithTheCatalogueLink(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::BASE.'/api/contact/accesses_request', content: $this->json([
            'file_identifier' => 'fid-1',
            'email_contact' => 'producteur@example.test',
            'layers' => [[
                'type' => 'layer',
                'name' => 'couche_b',
                'url' => 'https://data.example.test/wms-v/ows',
                'protocol' => 'OGC:WMS',
                'open' => false,
                'description' => 'couche_b - Accès restreint',
            ]],
            'myself' => true,
            'beneficiaries' => [],
            'message' => 'Merci',
        ]));

        self::assertResponseIsSuccessful();
        self::assertEmailCount(2);
        self::assertEmailAddressContains($this->sentEmail(0), 'To', 'producteur@example.test');
        self::assertEmailHtmlBodyContains($this->sentEmail(0), 'https://catalogue.test/dataset/fid-1');
        // type du service, lu dans le protocole de la couche
        self::assertEmailHtmlBodyContains($this->sentEmail(0), 'WMS');
    }

    private function sentEmail(int $index): RawMessage
    {
        $email = self::getMailerMessage($index);
        self::assertNotNull($email, "aucun courriel d’index $index");

        return $email;
    }

    /** @param array<string, mixed> $payload */
    private function json(array $payload): string
    {
        return json_encode($payload, JSON_THROW_ON_ERROR);
    }
}
