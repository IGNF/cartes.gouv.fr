<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Publication et dépublication explicites de la fiche de métadonnées d’une fiche de données.
 */
final class DatasheetPublicationRoutesTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const PUBLISH_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/datasheet/Fiche/publish';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
    }

    public function testPublishThenUnpublish(): void
    {
        EntrepotMockResponseFactory::seed('metadata', ['_id' => 'metadata-1', 'file_identifier' => 'ign.fiche', 'tags' => ['datasheet_name' => 'Fiche'], 'endpoints' => []]);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::PUBLISH_URL);
        self::assertResponseIsSuccessful();
        self::assertSame([EntrepotMockResponseFactory::METADATA_ENDPOINT_ID], array_column($this->jsonResponse($client), '_id'));
        self::assertSame([['_id' => EntrepotMockResponseFactory::METADATA_ENDPOINT_ID]], EntrepotMockResponseFactory::stored('metadata')[0]['endpoints']);

        $client->xmlHttpRequest('DELETE', self::PUBLISH_URL);
        self::assertResponseStatusCodeSame(204);
        self::assertSame([], EntrepotMockResponseFactory::stored('metadata')[0]['endpoints']);
    }

    public function testPublishingAPublishedMetadataCallsNothingUpstream(): void
    {
        EntrepotMockResponseFactory::seed('metadata', ['_id' => 'metadata-1', 'file_identifier' => 'ign.fiche', 'tags' => ['datasheet_name' => 'Fiche'], 'endpoints' => [['_id' => 'endpoint-metadata']]]);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::PUBLISH_URL);

        self::assertResponseIsSuccessful();
        self::assertSame([['_id' => 'endpoint-metadata']], $this->jsonResponse($client));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testUnpublishingAnUnpublishedMetadataCallsNothingUpstream(): void
    {
        EntrepotMockResponseFactory::seed('metadata', ['_id' => 'metadata-1', 'file_identifier' => 'ign.fiche', 'tags' => ['datasheet_name' => 'Fiche'], 'endpoints' => []]);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('DELETE', self::PUBLISH_URL);

        self::assertResponseStatusCodeSame(204);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testPublishingWithoutMetadataAnswers404(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::PUBLISH_URL);
        self::assertResponseStatusCodeSame(404);

        $client->xmlHttpRequest('DELETE', self::PUBLISH_URL);
        self::assertResponseStatusCodeSame(404);
    }
}
