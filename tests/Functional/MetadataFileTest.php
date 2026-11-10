<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Lecture du fichier XML ISO d’une métadonnée, brut ou converti en JSON (tests/Fixture/metadata/md-legacy-type-attributes.xml, synthétique).
 */
final class MetadataFileTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const FILE_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/metadata/md-legacy-type-attributes/file';

    public function testRawFileIsRelayedAsXml(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::FILE_URL);

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('Content-Type', 'application/xml');
        self::assertStringContainsString('synthetic-file-identifier', (string) $client->getResponse()->getContent());
    }

    // le détail champ par champ est dans tests/Unit/CswMetadataXmlReaderTest.php
    public function testJsonFormatExposesTheParsedMetadata(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::FILE_URL.'?format=json');

        self::assertResponseIsSuccessful();
        $json = $this->jsonResponse($client);

        self::assertSame('synthetic-file-identifier', $json['file_identifier']);
        self::assertSame('Jeu synthétique', $json['name']);
        self::assertSame(['layer', 'layer', 'style', 'capabilities', 'document'], array_column($json['online_resources'], 'type'));
        self::assertFalse($json['online_resources'][1]['open']);
    }

    public function testMissingFileIdentifierIsReadAsNull(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/metadata/md-legacy-no-file-identifier/file?format=json');

        self::assertResponseIsSuccessful();
        self::assertNull($this->jsonResponse($client)['file_identifier']);
    }

    public function testMissingLanguageAnswersAnErrorNamingIt(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/metadata/md-legacy-no-language/file?format=json');

        self::assertResponseStatusCodeSame(502);
        self::assertStringContainsString('langue (gmd:language) absente', (string) $client->getResponse()->getContent());
    }
}
