<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Publication d’un flux WMS raster ou WMTS depuis le nouveau formulaire : champ `data`, statique de légende ROK4 nommé d’après la configuration.
 */
final class WmsRasterPublishRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const PUBLISH_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/pyramid-raster/pyramid-1/wms-raster-wmts/publish';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed('stored_data', [
            '_id' => 'pyramid-1',
            'name' => 'pyramide',
            'type' => 'ROK4-PYRAMID-RASTER',
            'tags' => ['datasheet_name' => 'Fiche'],
            'type_infos' => ['levels' => ['12', '5', '9']],
        ]);
    }

    public function testLegendStyleIsRenamedAfterTheConfigurationAndReferencedByIt(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        $tmpEntries = $this->styleFilesDirEntries();

        $this->post($client, 'WMS-RASTER', $this->payload());

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        self::assertSame('WMS-RASTER', $configuration['type']);
        $statics = EntrepotMockResponseFactory::stored('statics');
        self::assertSame([sprintf('config_%s_style_wmsr', $configuration['_id'])], array_column($statics, 'name'));
        self::assertSame('Mon flux', $configuration['type_infos']['title']);
        self::assertSame('Orthophotographie des Ardennes', $configuration['type_infos']['abstract']);
        self::assertSame(['Hydrographie'], $configuration['type_infos']['keywords']);
        self::assertSame([['bottom_level' => '12', 'top_level' => '5', 'stored_data' => 'pyramid-1']], $configuration['type_infos']['used_data']);
        self::assertSame([$statics[0]['_id']], $configuration['type_infos']['styles']);
        self::assertSame(EntrepotMockResponseFactory::WMSR_PUBLIC_ENDPOINT_ID, EntrepotMockResponseFactory::stored('offerings')[0]['endpoint']['_id']);
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    public function testWmtsLegendStyleIsNamedAfterTheConfigurationOnTheWmtsEndpoint(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->post($client, 'WMTS-TMS', $this->payload());

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        self::assertSame('WMTS-TMS', $configuration['type']);
        $statics = EntrepotMockResponseFactory::stored('statics');
        self::assertSame([sprintf('config_%s_style_wmts', $configuration['_id'])], array_column($statics, 'name'));
        self::assertSame([['bottom_level' => '12', 'top_level' => '5', 'stored_data' => 'pyramid-1']], $configuration['type_infos']['used_data']);
        self::assertSame([$statics[0]['_id']], $configuration['type_infos']['styles']);
        self::assertSame(EntrepotMockResponseFactory::WMTS_PUBLIC_ENDPOINT_ID, EntrepotMockResponseFactory::stored('offerings')[0]['endpoint']['_id']);
    }

    public function testLegendStyleIsRemovedWhenTheOfferingCannotBeCreated(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('POST configurations/configuration-2/offerings');

        $this->post($client, 'WMS-RASTER', $this->payload());

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    public function testConfigurationAndLegendStyleAreRemovedWhenTheRenamingFails(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('PATCH statics/static-1');

        $this->post($client, 'WMS-RASTER', $this->payload());

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    public function testNoTemporaryFileRemainsWhenTheLegendStyleUploadFails(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        $tmpEntries = $this->styleFilesDirEntries();
        EntrepotMockResponseFactory::failNext('POST statics');

        $this->post($client, 'WMS-RASTER', $this->payload());

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    public function testLegendStyleIsKeptWhenAStepAfterTheOfferingFails(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('PUT metadata/metadata-1');

        $this->post($client, 'WMS-RASTER', $this->payload());

        self::assertResponseStatusCodeSame(500);
        self::assertCount(1, EntrepotMockResponseFactory::stored('offerings'));
        self::assertSame([sprintf('config_%s_style_wmsr', EntrepotMockResponseFactory::stored('configurations')[0]['_id'])], array_column(EntrepotMockResponseFactory::stored('statics'), 'name'));
    }

    public function testLegendStyleIsRemovedWhenTheDatasheetHasNoMetadata(): void
    {
        $client = $this->client();

        $this->post($client, 'WMS-RASTER', $this->payload());

        self::assertResponseStatusCodeSame(400);
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    public function testStoredDataOtherThanARasterPyramidAnswers400WithoutWriting(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'vectordb-1', 'type' => 'VECTOR-DB', 'tags' => ['datasheet_name' => 'Fiche']]);
        $this->seedMetadata();
        $client = $this->client();

        $client->xmlHttpRequest('POST', str_replace('pyramid-1', 'vectordb-1', self::PUBLISH_URL).'?type=WMS-RASTER', ['data' => json_encode($this->payload(), JSON_THROW_ON_ERROR)]);

        self::assertResponseStatusCodeSame(400);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testUnknownTypeAnswers400WithoutWriting(): void
    {
        $client = $this->client();

        $this->post($client, 'WFS', $this->payload());

        self::assertResponseStatusCodeSame(400);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testInvalidDescriptionAnswers422WithoutWriting(): void
    {
        $client = $this->client();

        foreach (['', str_repeat('a', 301)] as $description) {
            $this->post($client, 'WMS-RASTER', ['description' => $description] + $this->payload());

            self::assertResponseStatusCodeSame(422);
            self::assertSame(['description'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        }
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    private function client(): KernelBrowser
    {
        $client = self::createClient();
        $this->logIn($client);

        return $client;
    }

    private function seedMetadata(): void
    {
        EntrepotMockResponseFactory::seed(
            'metadata',
            ['_id' => 'metadata-1', 'file_identifier' => 'ign.fiche', 'tags' => ['datasheet_name' => 'Fiche'], 'endpoints' => []],
            (string) file_get_contents(__DIR__.'/../Fixture/metadata/expected-minimal.xml'),
        );
    }

    /** @return list<string> */
    private function styleFilesDirEntries(): array
    {
        $dir = (string) self::getContainer()->getParameter('style_files_path');

        return is_dir($dir) ? array_values(array_diff(scandir($dir) ?: [], ['.', '..'])) : [];
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function post(KernelBrowser $client, string $type, array $payload): void
    {
        $client->xmlHttpRequest('POST', self::PUBLISH_URL.'?type='.$type, ['data' => json_encode($payload, JSON_THROW_ON_ERROR)]);
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'title' => 'Mon flux',
            'technical_name' => 'SANDBOX.mon_flux',
            'description' => 'Orthophotographie des Ardennes',
            'themes' => ['Hydrographie'],
            'access' => 'public',
            'attribution' => null,
        ];
    }
}
