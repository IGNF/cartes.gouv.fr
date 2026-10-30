<?php

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Erreurs de l’Entrepôt relayées au front avec leur statut et leurs détails, et liste paginée vide.
 */
final class UpstreamErrorResponseTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const METADATA_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/metadata';

    public function testUpstreamJsonErrorIsRelayedWithItsDetails(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::METADATA_URL.'/0f8fad5b-d9cb-469f-a165-70867728950e');

        self::assertResponseStatusCodeSame(404);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');
        $json = $this->jsonResponse($client);
        self::assertSame(404, $json['status']);
        self::assertSame('Not Found', $json['title']);
        self::assertSame('NotFound', $json['details']['error']);
    }

    public function testUpstreamPlainTextErrorIsWrappedInDetails(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::METADATA_URL.'/'.EntrepotMockResponseFactory::METADATA_ID_UPSTREAM_DOWN.'/file');

        self::assertResponseStatusCodeSame(502);
        $json = $this->jsonResponse($client);
        self::assertSame(502, $json['status']);
        self::assertSame('upstream down', $json['detail']);
        self::assertSame(['message' => 'upstream down'], $json['details']);
    }

    public function testEmptyPaginatedListAnswersAnEmptyArray(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::METADATA_URL);

        self::assertResponseIsSuccessful();
        self::assertSame([], $this->jsonResponse($client));
    }
}
