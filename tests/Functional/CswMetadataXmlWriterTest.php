<?php

namespace App\Tests\Functional;

use App\Dto\Metadata\CswMetadata;
use App\Dto\Metadata\CswOnlineResource;
use App\Dto\Metadata\CswOnlineResourceType;
use App\Services\CswMetadataXmlReader;
use App\Services\CswMetadataXmlWriter;
use App\Tests\Support\CswMetadataFixtures;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\Filesystem\Filesystem;

/**
 * XML produit comparé à des fichiers de référence (indentation ignorée) et relu à l’identique : le XML est le seul stockage des champs saisis.
 */
final class CswMetadataXmlWriterTest extends KernelTestCase
{
    public function testFullMetadataMatchesTheReferenceFile(): void
    {
        $this->assertXmlEquals(CswMetadataFixtures::xml('expected-full'), $this->writer()->toXml(CswMetadataFixtures::full()));
    }

    // aucun élément vide pour les champs non renseignés
    public function testMinimalMetadataMatchesTheReferenceFile(): void
    {
        $this->assertXmlEquals(CswMetadataFixtures::xml('expected-minimal'), $this->writer()->toXml(new CswMetadata()));
    }

    public function testFullMetadataSurvivesAnXmlRoundTrip(): void
    {
        $metadata = CswMetadataFixtures::full();

        self::assertEquals($metadata, self::getContainer()->get(CswMetadataXmlReader::class)->read($this->writer()->toXml($metadata)));
    }

    public function testResourceWithoutNameWritesNoEmptyElement(): void
    {
        $metadata = new CswMetadata();
        $metadata->online_resources = [new CswOnlineResource(CswOnlineResourceType::Other, '', 'https://example.test')];

        self::assertStringNotContainsString('gmd:name', $this->writer()->toXml($metadata));
    }

    // un fichier d’avant la refonte garde la nature de ses ressources après une réécriture
    public function testLegacyFileKeepsItsResourceTypesAfterARewrite(): void
    {
        $reader = self::getContainer()->get(CswMetadataXmlReader::class);
        $legacy = $reader->read(CswMetadataFixtures::xml('md-legacy-type-attributes'));

        self::assertEquals($legacy, $reader->read($this->writer()->toXml($legacy)));
    }

    // horloge figée : la date des fichiers de référence est celle de CswMetadataFixtures::NOW
    private function writer(): CswMetadataXmlWriter
    {
        $container = self::getContainer();

        return new CswMetadataXmlWriter($container->get('twig'), $container->get('serializer'), $container->get('parameter_bag'), new Filesystem(), new MockClock(CswMetadataFixtures::NOW));
    }

    private function assertXmlEquals(string $expected, string $actual): void
    {
        self::assertSame($this->canonical($expected), $this->canonical($actual));
    }

    private function canonical(string $xml): string
    {
        $document = new \DOMDocument();
        $document->preserveWhiteSpace = false;
        self::assertTrue($document->loadXML($xml), 'XML mal formé');

        return (string) $document->C14N();
    }
}
