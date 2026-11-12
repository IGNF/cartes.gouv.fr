<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Publication d’un flux WMS vecteur depuis le nouveau formulaire : champ `data`, un fichier SLD `style_files[<table>]` par table.
 */
final class WmsVectorPublishRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const PUBLISH_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/stored_data/vectordb-1/wmsvector/publish';
    private const SLD = '<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld"><NamedLayer><Name>communes</Name></NamedLayer></StyledLayerDescriptor>';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'vectordb-1', 'type' => 'VECTOR-DB', 'tags' => ['datasheet_name' => 'Fiche']]);
    }

    public function testStyleFilesAreRenamedAfterTheConfigurationAndReferencedByItsTables(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        $tmpEntries = $this->styleFilesDirEntries();

        $this->post($client, $this->payload(), ['communes' => $this->sld('communes.sld'), 'routes nationales' => $this->sld('routes.sld')]);

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        self::assertSame('WMS-VECTOR', $configuration['type']);
        $statics = EntrepotMockResponseFactory::stored('statics');
        self::assertSame([
            sprintf('config_%s_style_wmsv_communes', $configuration['_id']),
            sprintf('config_%s_style_wmsv_routes nationales', $configuration['_id']),
        ], array_column($statics, 'name'));
        self::assertSame('Mon flux', $configuration['type_infos']['title']);
        self::assertSame('Les communes de France', $configuration['type_infos']['abstract']);
        self::assertSame(['Hydrographie'], $configuration['type_infos']['keywords']);
        self::assertSame([[
            'relations' => [['name' => 'communes', 'style' => $statics[0]['_id']], ['name' => 'routes nationales', 'style' => $statics[1]['_id']]],
            'stored_data' => 'vectordb-1',
        ]], $configuration['type_infos']['used_data']);
        self::assertSame(EntrepotMockResponseFactory::WMSV_PUBLIC_ENDPOINT_ID, EntrepotMockResponseFactory::stored('offerings')[0]['endpoint']['_id']);
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    public function testStyleFilesAreRemovedWhenTheOfferingCannotBeCreated(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('POST configurations/configuration-2/offerings');

        $this->post($client, $this->payload(['communes']), ['communes' => $this->sld('communes.sld')]);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    public function testUploadedStyleFilesAreRemovedWhenALaterOneIsRefused(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        $tmpEntries = $this->styleFilesDirEntries();
        EntrepotMockResponseFactory::failNext('POST statics', passes: 1);

        $this->post($client, $this->payload(), ['communes' => $this->sld('communes.sld'), 'routes nationales' => $this->sld('routes.sld')]);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    public function testConfigurationAndStyleFilesAreRemovedWhenTheRenamingFails(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('PATCH statics/static-1');

        $this->post($client, $this->payload(['communes']), ['communes' => $this->sld('communes.sld')]);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    public function testStyleFilesAreKeptWhenAStepAfterTheOfferingFails(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('PUT metadata/metadata-1');

        $this->post($client, $this->payload(['communes']), ['communes' => $this->sld('communes.sld')]);

        self::assertResponseStatusCodeSame(500);
        self::assertCount(1, EntrepotMockResponseFactory::stored('offerings'));
        self::assertSame([sprintf('config_%s_style_wmsv_communes', EntrepotMockResponseFactory::stored('configurations')[0]['_id'])], array_column(EntrepotMockResponseFactory::stored('statics'), 'name'));
    }

    public function testStyleFilesAreRemovedWhenTheDatasheetHasNoMetadata(): void
    {
        $client = $this->client();

        $this->post($client, $this->payload(['communes']), ['communes' => $this->sld('communes.sld')]);

        self::assertResponseStatusCodeSame(400);
        self::assertSame('Renseignez d’abord la description de la fiche de données', $this->jsonResponse($client)['detail']);
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    public function testMissingOrInvalidStyleFilesAnswer422OnTheirTablePathWithoutWriting(): void
    {
        $client = $this->client();
        $path = (string) tempnam(sys_get_temp_dir(), 'style');
        file_put_contents($path, '{}');

        $this->post($client, $this->payload(), ['communes' => new UploadedFile($path, 'communes.json', 'application/json', null, true)]);

        self::assertResponseStatusCodeSame(422);
        $paths = array_column($this->jsonResponse($client)['violations'], 'propertyPath');
        sort($paths);
        self::assertSame(['style_files[communes]', 'style_files[routes nationales]'], $paths);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testInvalidFieldsAnswer422WithTheirPaths(): void
    {
        $client = $this->client();

        $this->post($client, ['description' => str_repeat('a', 301), 'selected_tables' => []] + $this->payload());

        self::assertResponseStatusCodeSame(422);
        $paths = array_column($this->jsonResponse($client)['violations'], 'propertyPath');
        sort($paths);
        self::assertSame(['description', 'selected_tables'], $paths);

        $this->post($client, ['selected_tables' => array_map(fn (int $i) => "table_$i", range(1, 11))] + $this->payload());

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['selected_tables'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));

        $this->post($client, ['description' => ''] + $this->payload());

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['description'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
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

    private function sld(string $name): UploadedFile
    {
        $path = (string) tempnam(sys_get_temp_dir(), 'style');
        file_put_contents($path, self::SLD);

        return new UploadedFile($path, $name, 'application/octet-stream', null, true);
    }

    /** @return list<string> */
    private function styleFilesDirEntries(): array
    {
        $dir = (string) self::getContainer()->getParameter('style_files_path');

        return is_dir($dir) ? array_values(array_diff(scandir($dir) ?: [], ['.', '..'])) : [];
    }

    /**
     * @param array<string, mixed>        $payload
     * @param array<string, UploadedFile> $styleFiles par nom de table
     */
    private function post(KernelBrowser $client, array $payload, array $styleFiles = []): void
    {
        $client->xmlHttpRequest('POST', self::PUBLISH_URL, ['data' => json_encode($payload, JSON_THROW_ON_ERROR)], ['style_files' => $styleFiles]);
    }

    /**
     * @param list<string> $tables
     *
     * @return array<string, mixed>
     */
    private function payload(array $tables = ['communes', 'routes nationales']): array
    {
        return [
            'title' => 'Mon flux',
            'technical_name' => 'SANDBOX.mon_flux',
            'description' => 'Les communes de France',
            'themes' => ['Hydrographie'],
            'access' => 'public',
            'attribution' => null,
            'selected_tables' => $tables,
        ];
    }
}
