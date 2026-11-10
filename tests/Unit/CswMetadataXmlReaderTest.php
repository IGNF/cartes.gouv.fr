<?php

namespace App\Tests\Unit;

use App\Dto\Metadata\CswHierarchyLevel;
use App\Dto\Metadata\CswLanguage;
use App\Dto\Metadata\CswOnlineResource;
use App\Dto\Metadata\CswOnlineResourceType;
use App\Exception\InvalidCswMetadataException;
use App\Exception\MissingCswMetadataException;
use App\Services\CswMetadataXmlReader;
use App\Tests\Support\CswMetadataFixtures;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class CswMetadataXmlReaderTest extends TestCase
{
    private CswMetadataXmlReader $reader;

    protected function setUp(): void
    {
        $this->reader = new CswMetadataXmlReader();
    }

    public function testReadsEveryFieldOfALegacyFile(): void
    {
        $metadata = $this->reader->read(CswMetadataFixtures::xml('md-legacy-type-attributes'));

        self::assertSame('synthetic-file-identifier', $metadata->file_identifier);
        self::assertSame(CswHierarchyLevel::Dataset, $metadata->hierarchy_level);
        self::assertEquals(new CswLanguage('fre', 'français'), $metadata->language);
        self::assertSame('utf8', $metadata->charset);
        self::assertSame('Jeu synthétique', $metadata->title);
        self::assertSame('Résumé synthétique', $metadata->abstract);
        self::assertSame('2024-01-15', $metadata->creation_date);
        self::assertSame('Généalogie synthétique', $metadata->resource_genealogy);
        self::assertSame(['Occupation des terres'], $metadata->inspire_keywords);
        self::assertSame(['mot libre', 'autre'], $metadata->free_keywords);
        self::assertSame(['planningCadastre'], $metadata->topic_categories);
        self::assertSame('contact@example.test', $metadata->contact_email);
        self::assertSame('Organisation test', $metadata->organisation_name);
        self::assertSame('orga@example.test', $metadata->organisation_email);
        self::assertSame('100', $metadata->resolution);
        self::assertSame(['west' => -5.5, 'east' => 9.5, 'south' => 41.0, 'north' => 51.5], $metadata->bbox);
        self::assertSame('https://annexes.example.test/thumb.png', $metadata->thumbnail_url);
        self::assertSame('monthly', $metadata->frequency_code);

        self::assertSame(
            [CswOnlineResourceType::Layer, CswOnlineResourceType::Layer, CswOnlineResourceType::Style, CswOnlineResourceType::Capabilities, CswOnlineResourceType::Document],
            array_column($metadata->online_resources, 'type')
        );
        [$layer, $privateLayer, $style, $capabilities, $document] = $metadata->online_resources;
        self::assertSame('ns:couche_a', $layer->name);
        self::assertSame('OGC:WFS', $layer->protocol);
        self::assertSame('https://data.example.test/wfs/ows', $layer->url);
        self::assertTrue($layer->open);
        self::assertNull($layer->description);
        self::assertFalse($privateLayer->open);
        self::assertSame('couche_b - Accès restreint', $privateLayer->description);
        self::assertSame('https://annexes.example.test/style.sld', $style->url);
        // sans protocole dans le fichier : le lecteur pose celui du type, sinon la ressource réécrite deviendrait « other »
        self::assertSame(CswOnlineResource::STYLE_PROTOCOL, $style->protocol);
        self::assertSame('OGC:WFS-2.0.0-http-get-capabilities', $capabilities->protocol);
        self::assertSame(CswOnlineResource::DOCUMENT_PROTOCOL, $document->protocol);
        self::assertSame('GetCapabilities - WFS', $capabilities->name);
        self::assertSame('Notice', $document->name);
        self::assertNull($document->description);
    }

    // fichier écrit par le rédacteur : la nature des ressources vient du protocole, une ressource inconnue est gardée en « other »
    public function testClassifiesOnlineResourcesByProtocol(): void
    {
        $metadata = $this->reader->read(CswMetadataFixtures::xml('expected-full'));

        self::assertSame(
            ['layer', 'layer', 'layer', 'style', 'capabilities', 'document', 'document', 'other'],
            array_map(fn (CswOnlineResourceType $type) => $type->value, array_column($metadata->online_resources, 'type'))
        );
        self::assertSame('ESRI:ArcGIS', $metadata->online_resources[7]->protocol);
        self::assertSame('Hors catalogue', $metadata->online_resources[7]->description);
        self::assertTrue($metadata->online_resources[7]->open);
    }

    public function testReadsThroughACswGetRecordByIdEnvelope(): void
    {
        $metadata = $this->reader->read($this->cswEnvelope(CswMetadataFixtures::xml('md-legacy-type-attributes')));

        self::assertSame('synthetic-file-identifier', $metadata->file_identifier);
        self::assertCount(5, $metadata->online_resources);
    }

    #[DataProvider('documentsWithoutMetadata')]
    public function testDocumentWithoutMetadataIsReportedAsMissing(string $xml): void
    {
        $this->expectException(MissingCswMetadataException::class);

        $this->reader->read($xml);
    }

    /**
     * @return iterable<string, array{0: string}>
     */
    public static function documentsWithoutMetadata(): iterable
    {
        yield 'enveloppe CSW vide' => ['<?xml version="1.0" encoding="UTF-8"?><csw:GetRecordByIdResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2"></csw:GetRecordByIdResponse>'];
        yield 'corps vide' => [''];
        yield 'déclaration XML seule' => ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"];
    }

    public function testMalformedXmlIsRejectedWithTheParserMessage(): void
    {
        try {
            $this->reader->read('<gmd:MD_Metadata xmlns:gmd="http://www.isotc211.org/2005/gmd"><gmd:fileIdentifier></gmd:MD_Metadata>');
            self::fail('exception attendue');
        } catch (InvalidCswMetadataException $e) {
            self::assertSame(502, $e->getStatusCode());
            self::assertStringContainsString('XML mal formé', $e->getMessage());
            self::assertStringContainsString('fileIdentifier', $e->getMessage());
        }
    }

    public function testMissingLanguageIsRejectedNamingIt(): void
    {
        $this->expectException(InvalidCswMetadataException::class);
        $this->expectExceptionMessage('langue (gmd:language) absente');

        $this->reader->read(CswMetadataFixtures::xml('md-legacy-no-language'));
    }

    public function testMissingBboxCoordinateIsRejectedNamingIt(): void
    {
        $xml = preg_replace('#<gmd:northBoundLatitude>.*?</gmd:northBoundLatitude>#s', '', CswMetadataFixtures::xml('md-legacy-type-attributes'));

        $this->expectException(InvalidCswMetadataException::class);
        $this->expectExceptionMessage('northBoundLatitude');

        $this->reader->read((string) $xml);
    }

    public function testMissingFileIdentifierIsReadAsNull(): void
    {
        self::assertNull($this->reader->read(CswMetadataFixtures::xml('md-legacy-no-file-identifier'))->file_identifier);
    }

    public function testLegacyQuaterlyFrequencyIsReadAsQuarterly(): void
    {
        $xml = str_replace('codeListValue="monthly"', 'codeListValue="quaterly"', CswMetadataFixtures::xml('md-legacy-type-attributes'));

        self::assertSame('quarterly', $this->reader->read($xml)->frequency_code);
    }

    /**
     * @param 'WFS'|'WMS'|'WMTS' $service
     * @param list<string>       $urls
     */
    #[DataProvider('capabilitiesProtocols')]
    public function testCapabilitiesProtocolTakesItsVersionFromTheServiceUrl(string $expected, string $service, array $urls): void
    {
        self::assertSame($expected, CswOnlineResource::capabilitiesProtocol($service, $urls));
    }

    /**
     * @return iterable<string, array{0: string, 1: string, 2: list<string>}>
     */
    public static function capabilitiesProtocols(): iterable
    {
        yield 'paramètre version' => ['OGC:WMS-1.1.1-http-get-capabilities', 'WMS', ['https://data.example.test/wms-v?service=WMS&version=1.1.1&request=GetCapabilities']];
        yield 'paramètre VERSION en majuscules' => ['OGC:WFS-1.1.0-http-get-capabilities', 'WFS', ['https://data.example.test/wfs?SERVICE=WFS&VERSION=1.1.0']];
        yield 'première URL sans version, seconde avec' => ['OGC:WMTS-1.0.1-http-get-capabilities', 'WMTS', ['https://data.example.test/tms/1.0.0/couche', 'https://data.example.test/wmts?version=1.0.1']];
        yield 'aucune version dans l’URL' => ['OGC:WFS-2.0.0-http-get-capabilities', 'WFS', ['https://data.example.test/wfs']];
        yield 'aucune URL' => ['OGC:WMS-1.3.0-http-get-capabilities', 'WMS', []];
    }

    private function cswEnvelope(string $metadataXml): string
    {
        $body = (string) preg_replace('/^<\?xml[^>]*\?>/', '', $metadataXml);

        return '<?xml version="1.0" encoding="UTF-8"?><csw:GetRecordByIdResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2">'.$body.'</csw:GetRecordByIdResponse>';
    }
}
