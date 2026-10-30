<?php

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Lecture du fichier XML ISO d’une métadonnée, brut ou converti en JSON (tests/Fixture/metadata/md-1.xml, synthétique).
 */
final class MetadataFileTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const FILE_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/metadata/md-1/file';

    public function testRawFileIsRelayedAsXml(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::FILE_URL);

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('Content-Type', 'application/xml');
        self::assertStringContainsString('synthetic-file-identifier', (string) $client->getResponse()->getContent());
    }

    public function testJsonFormatExposesEveryParsedField(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::FILE_URL.'?format=json');

        self::assertResponseIsSuccessful();
        $json = $this->jsonResponse($client);

        self::assertSame('synthetic-file-identifier', $json['file_identifier']);
        self::assertSame('dataset', $json['hierarchy_level']);
        self::assertSame(['code' => 'fre', 'language' => 'français'], $json['language']);
        self::assertSame('utf8', $json['charset']);
        self::assertSame('Jeu synthétique', $json['title']);
        self::assertSame('Résumé synthétique', $json['abstract']);
        self::assertSame('Généalogie synthétique', $json['resource_genealogy']);
        self::assertSame(['Occupation des terres'], $json['inspire_keywords']);
        self::assertSame(['mot libre', 'autre'], $json['free_keywords']);
        self::assertSame(['planningCadastre'], $json['topic_categories']);
        // le sérialiseur rend 41.0 en entier : comparaison souple
        self::assertEquals(['west' => -5.5, 'east' => 9.5, 'south' => 41, 'north' => 51.5], $json['bbox']);
        self::assertSame('2024-01-15', $json['creation_date']);
        self::assertSame('contact@example.test', $json['contact_email']);
        self::assertSame('Organisation test', $json['organisation_name']);
        self::assertSame('orga@example.test', $json['organisation_email']);
        self::assertSame('100', $json['resolution']);
        self::assertSame('monthly', $json['frequency_code']);
        self::assertSame('https://annexes.example.test/thumb.png', $json['thumbnail_url']);

        self::assertCount(2, $json['layers']);
        self::assertSame('ns:couche_a', $json['layers'][0]['name']);
        self::assertSame('OGC:WFS', $json['layers'][0]['gmd_online_resource_protocol']);
        self::assertSame('https://data.example.test/wfs/ows', $json['layers'][0]['gmd_online_resource_url']);
        self::assertSame('off-1', $json['layers'][0]['offering_id']);
        self::assertTrue($json['layers'][0]['open']);
        self::assertSame('couche_b', $json['layers'][1]['name']);
        self::assertFalse($json['layers'][1]['open']);

        self::assertCount(1, $json['style_files']);
        self::assertCount(1, $json['capabilities_files']);
        self::assertCount(1, $json['documents']);
    }
}
