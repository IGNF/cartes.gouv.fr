<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Génération d’une pyramide vecteur depuis une base vecteur : exécution créée, taguée puis lancée.
 */
final class PyramidVectorAddRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const ADD_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/pyramid-vector/add';
    private const DATASTORE_PATH = '/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID;

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed('stored_data', [
            '_id' => 'vectordb-1',
            'type' => 'VECTOR-DB',
            'tags' => ['datasheet_name' => 'Fiche', 'upload_id' => 'upload-1', 'proc_int_id' => 'proc-int-1', 'producer' => 'Producteur', 'production_year' => '2026'],
        ]);
    }

    public function testGenerationCreatesTagsAndLaunchesTheExecution(): void
    {
        $client = $this->client();

        $this->post($client);

        self::assertResponseIsSuccessful();
        $writes = array_map(fn (array $request) => $request['method'].' '.substr($request['path'], strlen(self::DATASTORE_PATH)), EntrepotMockResponseFactory::writeRequests());
        self::assertSame([
            'POST /processings/executions',
            'POST /stored_data/stored-data-1/tags',
            'POST /processings/executions/execution-2/launch',
        ], $writes);

        $execution = json_decode(EntrepotMockResponseFactory::writeRequests()[0]['body'], true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['stored_data' => ['vectordb-1']], $execution['inputs']);
        self::assertSame(['stored_data' => ['name' => 'pyramide_vecteur', 'storage_tags' => ['PYRAMIDE']]], $execution['output']);
        self::assertSame([
            'composition' => [['table' => 'troncon', 'attributes' => ['nom'], 'bottom_level' => '14', 'top_level' => '5']],
            'bottom_level' => '14',
            'top_level' => '5',
            'tippecanoe_options' => '-zg',
        ], $execution['parameters']);
        self::assertArrayNotHasKey('callback', $execution);

        self::assertSame([
            'datasheet_name' => 'Fiche',
            'upload_id' => 'upload-1',
            'proc_int_id' => 'proc-int-1',
            'vectordb_id' => 'vectordb-1',
            'proc_pyr_creat_id' => 'execution-2',
            'is_sample' => 'false',
            'producer' => 'Producteur',
            'production_year' => '2026',
        ], EntrepotMockResponseFactory::stored('stored_data')[1]['tags']);
        self::assertSame('WAITING', EntrepotMockResponseFactory::stored('processings/executions')[0]['status']);
    }

    private function client(): KernelBrowser
    {
        $client = self::createClient();
        $this->logIn($client);

        return $client;
    }

    private function post(KernelBrowser $client): void
    {
        $client->xmlHttpRequest('POST', self::ADD_URL, server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'technical_name' => 'pyramide_vecteur',
            'area' => null,
            'tippecanoe' => '-zg',
            'vectordb_id' => 'vectordb-1',
            'composition' => [['table' => 'troncon', 'attributes' => ['nom'], 'bottom_level' => 14, 'top_level' => 5]],
            'email_notification' => false,
        ], JSON_THROW_ON_ERROR));
    }
}
