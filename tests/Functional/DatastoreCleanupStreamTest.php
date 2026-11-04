<?php

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Suppression du contenu d’un entrepôt : jamais déclenchée par un GET, flux SSE en POST.
 */
final class DatastoreCleanupStreamTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const STREAM_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/cleanup/delete-stream';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
    }

    // un GET reçoit le 403 de la garde ou la page React (route attrape-tout du front), jamais le flux
    public function testGetNeverReachesTheStream(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        foreach ([false, true] as $xhr) {
            $xhr ? $client->xmlHttpRequest('GET', self::STREAM_URL) : $client->request('GET', self::STREAM_URL);

            self::assertStringStartsNotWith('text/event-stream', (string) $client->getResponse()->headers->get('Content-Type'));
            self::assertStringNotContainsString('event: started', $client->getInternalResponse()->getContent());
        }
    }

    public function testXhrPostStreamsStartedThenDone(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::STREAM_URL);

        self::assertResponseIsSuccessful();
        self::assertStringStartsWith('text/event-stream', (string) $client->getResponse()->headers->get('Content-Type'));

        preg_match_all('/^event: (\w+)$/m', $client->getInternalResponse()->getContent(), $matches);
        self::assertSame('started', $matches[1][0] ?? null);
        self::assertSame('done', end($matches[1]));
    }

    // erreur de l’Entrepôt dès le comptage : le client reçoit failed, pas une coupure
    public function testUpstreamErrorBeforeStartedStreamsFailed(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::BASE.'/api/datastores/unknown-datastore/cleanup/delete-stream');

        preg_match_all('/^event: (\w+)$/m', $client->getInternalResponse()->getContent(), $matches);
        self::assertSame(['failed'], $matches[1]);
    }
}
