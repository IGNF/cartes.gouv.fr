<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Suppression d’une donnée stockée : annulation des traitements, annexe de légende, puis la donnée.
 */
final class StoredDataDeleteRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const DATASTORE_PATH = '/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID;
    private const DELETE_URL = self::BASE.self::DATASTORE_PATH.'/stored_data/pyramid-1';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed('stored_data', [
            '_id' => 'pyramid-1',
            'type' => 'ROK4-PYRAMID-RASTER',
            'tags' => ['datasheet_name' => 'Fiche'],
            'extra' => ['legend' => ['annexe_id' => 'legend-1']],
        ]);
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'legend-1', 'paths' => ['/legend/pyramid-1.png']]);
    }

    public function testProcessingsAreAbortedThenLegendAndStoredDataAreRemoved(): void
    {
        // traitement en cours qui lit la donnée, et celui qui la produit
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'output-1', 'type' => 'ROK4-PYRAMID-RASTER', 'tags' => []]);
        EntrepotMockResponseFactory::seed('processings/executions', [
            '_id' => 'reader-1',
            'status' => 'PROGRESS',
            'inputs' => ['stored_data' => [['_id' => 'pyramid-1']], 'upload' => []],
            'output' => ['stored_data' => ['_id' => 'output-1']],
        ]);
        EntrepotMockResponseFactory::seed('processings/executions', [
            '_id' => 'producer-1',
            'status' => 'WAITING',
            'inputs' => ['stored_data' => [], 'upload' => []],
            'output' => ['stored_data' => ['_id' => 'pyramid-1']],
        ]);
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::DELETE_URL);

        self::assertResponseStatusCodeSame(204);
        self::assertSame([
            'POST '.self::DATASTORE_PATH.'/processings/executions/reader-1/abort',
            'DELETE '.self::DATASTORE_PATH.'/stored_data/output-1',
            'POST '.self::DATASTORE_PATH.'/processings/executions/producer-1/abort',
            'DELETE '.self::DATASTORE_PATH.'/annexes/legend-1',
            'DELETE '.self::DATASTORE_PATH.'/stored_data/pyramid-1',
        ], array_map(fn (array $request) => $request['method'].' '.$request['path'], EntrepotMockResponseFactory::writeRequests()));
        self::assertSame([], EntrepotMockResponseFactory::stored('stored_data'));
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
    }

    public function testOutputOfAProcessingThatSucceededBeforeTheAbortIsKept(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'output-1', 'type' => 'ROK4-PYRAMID-VECTOR', 'tags' => []]);
        EntrepotMockResponseFactory::seed('processings/executions', [
            '_id' => 'reader-1',
            'status' => 'PROGRESS',
            'inputs' => ['stored_data' => [['_id' => 'pyramid-1']], 'upload' => []],
            'output' => ['stored_data' => ['_id' => 'output-1']],
            // terminé entre la liste et l’annulation
            'status_on_abort' => 'SUCCESS',
        ]);
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::DELETE_URL);

        self::assertResponseStatusCodeSame(204);
        self::assertSame(['output-1'], array_column(EntrepotMockResponseFactory::stored('stored_data'), '_id'));
    }

    public function testStoredDataIsRemovedWhenTheLegendAnnexIsAlreadyGone(): void
    {
        EntrepotMockResponseFactory::failNext('DELETE annexes/legend-1', status: 404);
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::DELETE_URL);

        self::assertResponseStatusCodeSame(204);
        self::assertSame([], EntrepotMockResponseFactory::stored('stored_data'));
    }

    public function testStoredDataIsKeptWhenTheLegendAnnexRemovalFails(): void
    {
        EntrepotMockResponseFactory::failNext('DELETE annexes/legend-1');
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::DELETE_URL);

        self::assertResponseStatusCodeSame(500);
        self::assertSame(['pyramid-1'], array_column(EntrepotMockResponseFactory::stored('stored_data'), '_id'));
    }

    private function client(): KernelBrowser
    {
        $client = self::createClient();
        $this->logIn($client);

        return $client;
    }
}
