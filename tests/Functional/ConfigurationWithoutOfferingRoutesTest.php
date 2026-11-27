<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Configuration d’une fiche sans offre : suppression avec ses images et fichiers de style.
 */
final class ConfigurationWithoutOfferingRoutesTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const DATASTORE_PATH = '/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID;
    private const ANNEXES_URL = 'https://entrepot.test/annexes/entrepot_test';
    private const PUBLISHED_ID = '11111111-1111-4111-8111-111111111111';
    private const ORPHAN_ID = '22222222-2222-4222-8222-222222222222';
    private const OTHER_DATASHEET_ID = '33333333-3333-4333-8333-333333333333';
    private const THUMBNAIL_UUID = '0f8e3c2a-1b2c-4d5e-8f90-123456789abc';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed('configurations', ['_id' => self::PUBLISHED_ID, 'name' => 'Publié', 'status' => 'PUBLISHED', 'tags' => ['datasheet_name' => 'Fiche']]);
        EntrepotMockResponseFactory::seed('offerings', ['_id' => 'offering-1', 'configuration' => ['_id' => self::PUBLISHED_ID]]);
        EntrepotMockResponseFactory::seed('configurations', [
            '_id' => self::ORPHAN_ID,
            'name' => 'Orpheline',
            'status' => 'UNPUBLISHED',
            'tags' => ['datasheet_name' => 'Fiche'],
            'extra' => ['_search' => ['url_vignette' => self::ANNEXES_URL.'/thumbnail/'.self::THUMBNAIL_UUID.'.png'], 'styles' => []],
            'type_infos' => ['styles' => ['legend-static-1', 'legend-static-2']],
        ]);
        EntrepotMockResponseFactory::seed('configurations', ['_id' => self::OTHER_DATASHEET_ID, 'name' => 'Autre fiche', 'status' => 'UNPUBLISHED', 'tags' => ['datasheet_name' => 'Autre']]);
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'thumbnail-1', 'paths' => ['/thumbnail/'.self::THUMBNAIL_UUID.'.png'], 'labels' => ['type=service-thumbnail']]);
        // annexe de styles laissée par les anciens formulaires
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'legacy-styles-1', 'paths' => ['/configuration/'.self::ORPHAN_ID.'/styles.json']]);
        EntrepotMockResponseFactory::seed('statics', ['_id' => 'legend-static-1']);
        EntrepotMockResponseFactory::seed('statics', ['_id' => 'legend-static-2']);
    }

    public function testRemovesTheConfigurationThenItsFiles(): void
    {
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::BASE.self::DATASTORE_PATH.'/configurations/'.self::ORPHAN_ID);

        self::assertResponseStatusCodeSame(204);
        self::assertSame([
            'DELETE '.self::DATASTORE_PATH.'/configurations/'.self::ORPHAN_ID,
            'DELETE '.self::DATASTORE_PATH.'/annexes/thumbnail-1',
            'DELETE '.self::DATASTORE_PATH.'/annexes/legacy-styles-1',
            'DELETE '.self::DATASTORE_PATH.'/statics/legend-static-1',
            'DELETE '.self::DATASTORE_PATH.'/statics/legend-static-2',
        ], array_map(fn (array $request) => $request['method'].' '.$request['path'], EntrepotMockResponseFactory::writeRequests()));
        self::assertSame([self::PUBLISHED_ID, self::OTHER_DATASHEET_ID], array_column(EntrepotMockResponseFactory::stored('configurations'), '_id'));
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    public function testAFailedFileRemovalDoesNotStopTheOthers(): void
    {
        EntrepotMockResponseFactory::failNext('DELETE statics/legend-static-1', status: 409);
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::BASE.self::DATASTORE_PATH.'/configurations/'.self::ORPHAN_ID);

        self::assertResponseStatusCodeSame(204);
        self::assertNotContains(self::ORPHAN_ID, array_column(EntrepotMockResponseFactory::stored('configurations'), '_id'));
        self::assertSame(['legend-static-1'], array_column(EntrepotMockResponseFactory::stored('statics'), '_id'));
    }

    public function testRefusesAConfigurationThatStillHasAnOffering(): void
    {
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::BASE.self::DATASTORE_PATH.'/configurations/'.self::PUBLISHED_ID);

        self::assertResponseStatusCodeSame(409);
        self::assertStringContainsString('encore une offre', json_decode((string) $client->getResponse()->getContent(), true)['detail']);
        self::assertContains(self::PUBLISHED_ID, array_column(EntrepotMockResponseFactory::stored('configurations'), '_id'));
    }

    private function client(): KernelBrowser
    {
        $client = self::createClient();
        $this->logIn($client);

        return $client;
    }
}
