<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Génération d’une pyramide raster depuis un flux WMS-Vecteur : charge utile validée avant tout appel à l’Entrepôt.
 */
final class PyramidRasterAddRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const ADD_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/pyramid-raster/add';
    private const DATASTORE_PATH = '/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID;
    private const WMSV_OFFERING_ID = '0f8e3c2a-1b2c-4d5e-8f90-123456789abc';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
    }

    public function testInvalidPayloadAnswers422WithTheirPathsWithoutWriting(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::ADD_URL, server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'technical_name' => '',
            'wmsv_offering_id' => 'pas-un-uuid',
            'wmsv_config_bbox' => '',
            'zoom_range' => [4],
        ], JSON_THROW_ON_ERROR));

        self::assertResponseStatusCodeSame(422);
        $paths = array_column($this->jsonResponse($client)['violations'], 'propertyPath');
        sort($paths);
        self::assertSame(['technical_name', 'wmsv_config_bbox', 'wmsv_offering_id', 'zoom_range'], $paths);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testZoomLevelsOutsideTheSliderBoundsAnswer422(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::ADD_URL, server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'technical_name' => 'pyramide',
            'wmsv_offering_id' => '0f8e3c2a-1b2c-4d5e-8f90-123456789abc',
            'wmsv_config_bbox' => 'POLYGON((0 0,1 0,1 1,0 0))',
            'zoom_range' => [0, 19],
        ], JSON_THROW_ON_ERROR));

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['zoom_range[0]', 'zoom_range[1]'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testTechnicalNameWithForbiddenCharactersAnswers422(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::ADD_URL, server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'technical_name' => 'pyramide raster/é',
            'wmsv_offering_id' => self::WMSV_OFFERING_ID,
            'wmsv_config_bbox' => 'POLYGON((0 0,1 0,1 1,0 0))',
            'zoom_range' => [5, 12],
        ], JSON_THROW_ON_ERROR));

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['technical_name'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testGenerationHarvestsTheWmsvServiceThenTagsAndLaunchesThePyramid(): void
    {
        $this->seedWmsvService();
        $client = self::createClient();
        $this->logIn($client);

        $this->post($client);

        self::assertResponseIsSuccessful();
        $writes = array_map(fn (array $request) => $request['method'].' '.substr($request['path'], strlen(self::DATASTORE_PATH)), EntrepotMockResponseFactory::writeRequests());
        self::assertSame([
            'POST /processings/executions',
            'POST /annexes',
            'PATCH /annexes/annexe-3',
            'POST /stored_data/stored-data-1/tags',
            'PATCH /stored_data/stored-data-1',
            'POST /processings/executions/execution-2/launch',
        ], $writes);

        $execution = json_decode(EntrepotMockResponseFactory::writeRequests()[0]['body'], true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['stored_data' => ['name' => 'pyramide_raster']], $execution['output']);
        self::assertSame([
            'samplesperpixel' => 3,
            'sampleformat' => 'UINT8',
            'tms' => 'PM',
            'compression' => 'jpg',
            'bottom' => '12',
            'harvest_levels' => ['12', '11', '10', '9', '8', '7', '6', '5'],
            'harvest_format' => 'image/jpeg',
            'harvest_url' => 'https://wms.test/public',
            'harvest_layers' => 'couche_wmsv',
            'harvest_area' => 'POLYGON((0 0,1 0,1 1,0 0))',
        ], $execution['parameters']);
        self::assertArrayNotHasKey('callback', $execution);

        $pyramid = EntrepotMockResponseFactory::stored('stored_data')[1];
        self::assertSame([
            'datasheet_name' => 'Fiche',
            'producer' => 'Producteur',
            'production_year' => '2026',
            'zone' => 'Ardennes',
            'upload_id' => 'upload-1',
            'proc_int_id' => 'proc-int-1',
            'vectordb_id' => 'vectordb-1',
            'proc_pyr_creat_id' => 'execution-2',
        ], $pyramid['tags']);
        $annexe = EntrepotMockResponseFactory::stored('annexes')[0];
        self::assertSame(['/legend/stored-data-1.png'], $annexe['paths']);
        self::assertSame(['url' => 'https://entrepot.test/annexes/entrepot_test/legend/stored-data-1.png', 'annexe_id' => $annexe['_id']], $pyramid['extra']['legend']);
        self::assertSame('WAITING', EntrepotMockResponseFactory::stored('processings/executions')[0]['status']);
    }

    public function testAFailureAfterTheExecutionRemovesTheExecutionAndTheLegendAnnexe(): void
    {
        $this->seedWmsvService();
        $client = self::createClient();
        $this->logIn($client);
        $tmpEntries = $this->styleFilesDirEntries();
        EntrepotMockResponseFactory::failNext('POST stored_data/stored-data-1/tags');

        $this->post($client);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('processings/executions'));
        self::assertSame(['vectordb-1'], array_column(EntrepotMockResponseFactory::stored('stored_data'), '_id'));
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    public function testNoTemporaryFileRemainsAfterAGeneration(): void
    {
        $this->seedWmsvService();
        $client = self::createClient();
        $this->logIn($client);
        $tmpEntries = $this->styleFilesDirEntries();

        $this->post($client);

        self::assertResponseIsSuccessful();
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    /** @return list<string> */
    private function styleFilesDirEntries(): array
    {
        $dir = (string) self::getContainer()->getParameter('style_files_path');

        return is_dir($dir) ? array_values(array_diff(scandir($dir) ?: [], ['.', '..'])) : [];
    }

    private function seedWmsvService(): void
    {
        EntrepotMockResponseFactory::seed('offerings', [
            '_id' => self::WMSV_OFFERING_ID,
            'layer_name' => 'couche_wmsv',
            'configuration' => ['_id' => 'configuration-wmsv'],
            'endpoint' => ['_id' => EntrepotMockResponseFactory::WMSV_PUBLIC_ENDPOINT_ID],
            'urls' => [['type' => 'WMS', 'url' => 'https://wms.test/public?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities']],
        ]);
        EntrepotMockResponseFactory::seed('configurations', [
            '_id' => 'configuration-wmsv',
            'tags' => ['datasheet_name' => 'Fiche'],
            'type_infos' => ['used_data' => [['stored_data' => 'vectordb-1']]],
        ]);
        EntrepotMockResponseFactory::seed('stored_data', [
            '_id' => 'vectordb-1',
            'type' => 'VECTOR-DB',
            'tags' => ['datasheet_name' => 'Fiche', 'upload_id' => 'upload-1', 'proc_int_id' => 'proc-int-1', 'producer' => 'Producteur', 'production_year' => '2026', 'zone' => 'Ardennes', 'integration_progress' => 'ignoré'],
        ]);
    }

    private function post(KernelBrowser $client): void
    {
        $client->xmlHttpRequest('POST', self::ADD_URL, server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'technical_name' => 'pyramide_raster',
            'wmsv_offering_id' => self::WMSV_OFFERING_ID,
            'wmsv_config_bbox' => 'POLYGON((0 0,1 0,1 1,0 0))',
            'zoom_range' => [12, 5],
        ], JSON_THROW_ON_ERROR));
    }
}
