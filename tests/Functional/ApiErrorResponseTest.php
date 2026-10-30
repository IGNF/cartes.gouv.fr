<?php

namespace App\Tests\Functional;

use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Corps d’erreur des routes d’API en Problem Details (RFC 9457), quelle que soit l’origine de l’erreur.
 */
final class ApiErrorResponseTest extends WebTestCase
{
    use KeycloakLoginTrait;

    public function testApplicationErrorAnswersProblemJson(): void
    {
        $client = self::createClient();

        $client->xmlHttpRequest('POST', self::BASE.'/datastore_create_request', content: '{}');

        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');
        $json = $this->jsonResponse($client);
        self::assertSame(401, $json['status']);
        self::assertSame('Unauthorized', $json['title']);
        self::assertSame('Demande réservée aux utilisateurs connectés', $json['detail']);
        self::assertSame([], $json['details']);
        self::assertArrayNotHasKey('type', $json);
    }

    public function testValidationErrorListsViolations(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::BASE.'/api/users/add_key', server: ['CONTENT_TYPE' => 'application/json'], content: '{"name": "", "accesses": []}');

        self::assertResponseStatusCodeSame(422);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');
        $json = $this->jsonResponse($client);
        self::assertSame(422, $json['status']);
        self::assertContains('name', array_column($json['violations'], 'propertyPath'));
    }

    public function testUnexpectedErrorHidesItsMessageAndTraceOutsideDebug(): void
    {
        $client = self::createClient(['debug' => false]);

        // message en tableau : TypeError dans le filtre de mots interdits
        $client->xmlHttpRequest('POST', self::BASE.'/contact_us', content: (string) json_encode([
            'email_contact' => 'visiteur@example.test',
            'importance' => '0',
            'message' => ['pas une chaîne'],
            'first_name' => 'Prénom',
            'last_name' => 'Nom',
            'category' => 'Autre',
            'organization' => 'Organisation test',
        ]));

        self::assertResponseStatusCodeSame(500);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');
        self::assertSame(['title' => 'Internal Server Error', 'status' => 500, 'detail' => 'Internal Server Error'], $this->jsonResponse($client));
    }

    public function testContactFormWithoutAcceptHeaderAnswersProblemJson(): void
    {
        $client = self::createClient();

        // le site de documentation n’envoie que X-Requested-With
        $client->request('POST', self::BASE.'/contact_us', server: ['HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest', 'HTTP_ACCEPT' => '*/*'], content: '{"importance": "0"}');

        self::assertResponseStatusCodeSame(400);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');
        self::assertSame('Le formulaire de contact est incomplet', $this->jsonResponse($client)['detail']);
    }
}
