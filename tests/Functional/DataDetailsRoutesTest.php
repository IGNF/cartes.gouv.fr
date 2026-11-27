<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Pages de détail : donnée stockée, livraison et journaux d’exécution.
 */
final class DataDetailsRoutesTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const DATASTORE_PATH = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID;
    private const PYRAMID_ID = '4e9312db-727a-4885-a3e7-d74e847778e5';
    private const VECTORDB_ID = 'd0cdd3b7-03c4-4fc3-b363-02fb5354fad6';
    private const UPLOAD_ID = '557178bc-3d37-49c2-96b5-ec7ec3197516';
    private const INTEGRATION_ID = '8ade70bd-96f2-4fe8-a636-e8a69359457a';
    private const PYRAMID_CREATION_ID = '2f63fac6-866a-46da-a27b-ae7ec9a50e96';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed('stored_data', [
            '_id' => self::PYRAMID_ID,
            'name' => 'pyramide',
            'type' => 'ROK4-PYRAMID-RASTER',
            'status' => 'GENERATED',
            'tags' => [
                'datasheet_name' => 'Fiche',
                'producer' => 'IGN',
                'date' => '2026-11-13',
                'production_year' => '2026',
                'upload_id' => self::UPLOAD_ID,
                'vectordb_id' => self::VECTORDB_ID,
                'proc_int_id' => self::INTEGRATION_ID,
                'proc_pyr_creat_id' => self::PYRAMID_CREATION_ID,
            ],
        ]);
        EntrepotMockResponseFactory::seed('stored_data', [
            '_id' => self::VECTORDB_ID,
            'name' => 'base',
            'type' => 'VECTOR-DB',
            'extent' => ['type' => 'Feature'],
            'type_infos' => ['relations' => [['name' => 'table', 'attributes' => ['fid' => 'integer']]]],
            'tags' => [],
        ]);
        EntrepotMockResponseFactory::seed('uploads', [
            '_id' => self::UPLOAD_ID,
            'name' => 'livraison',
            'status' => 'CLOSED',
            'tags' => ['datasheet_name' => 'Fiche', 'data_upload_path' => 'abc/fichier.gpkg', 'zone' => 'France'],
            'checks' => [
                'asked' => [['_id' => 'check-0', 'check' => ['name' => 'Vérification antivirus']]],
                'in_progress' => [['_id' => 'check-3', 'check' => ['name' => 'Vérification raster']]],
                'passed' => [['_id' => 'check-1', 'check' => ['name' => 'Vérification standard']]],
                'failed' => [['_id' => 'check-2', 'check' => ['name' => 'Vérification vecteur']]],
            ],
        ]);
        EntrepotMockResponseFactory::seed('processings/executions', [
            '_id' => self::INTEGRATION_ID,
            'status' => 'SUCCESS',
            'processing' => ['name' => 'Intégration'],
            'output' => ['stored_data' => ['_id' => self::VECTORDB_ID]],
        ]);
        EntrepotMockResponseFactory::seed('processings/executions', [
            '_id' => self::PYRAMID_CREATION_ID,
            'status' => 'SUCCESS',
            'processing' => ['name' => 'Calcul de pyramide'],
            'output' => ['stored_data' => ['_id' => self::PYRAMID_ID]],
        ]);
    }

    public function testStoredDataDetailsGatherLineage(): void
    {
        $client = $this->client();

        $client->xmlHttpRequest('GET', self::DATASTORE_PATH.'/stored_data/'.self::PYRAMID_ID.'/details');

        self::assertResponseIsSuccessful();
        $json = $this->jsonResponse($client);
        self::assertSame(['datasheet_name' => 'Fiche', 'producer' => 'IGN', 'date' => '2026-11-13', 'production_year' => '2026'], $json['stored_data']['tags']);
        self::assertSame([
            '_id' => self::VECTORDB_ID,
            'name' => 'base',
            'extent' => ['type' => 'Feature'],
            'relations' => [['name' => 'table', 'attributes' => ['fid' => 'integer']]],
        ], $json['source_vectordb']);
        self::assertSame(['datasheet_name' => 'Fiche', 'zone' => 'France'], $json['upload']['tags']);
        self::assertSame([], $json['upload']['file_tree']);
        self::assertSame([
            ['_id' => 'check-0', 'name' => 'Vérification antivirus', 'status' => 'WAITING'],
            ['_id' => 'check-3', 'name' => 'Vérification raster', 'status' => 'PROGRESS'],
            ['_id' => 'check-1', 'name' => 'Vérification standard', 'status' => 'SUCCESS'],
            ['_id' => 'check-2', 'name' => 'Vérification vecteur', 'status' => 'FAILURE'],
        ], $json['upload']['checks']);
        self::assertSame([
            ['_id' => self::INTEGRATION_ID, 'name' => 'Intégration', 'status' => 'SUCCESS', 'output_id' => self::VECTORDB_ID],
            ['_id' => self::PYRAMID_CREATION_ID, 'name' => 'Calcul de pyramide', 'status' => 'SUCCESS', 'output_id' => self::PYRAMID_ID],
        ], $json['processing_executions']);
    }

    public function testVanishedUploadIsLeftOut(): void
    {
        EntrepotMockResponseFactory::failNext('GET uploads/'.self::UPLOAD_ID, status: 404);

        $json = $this->pyramidDetails();

        self::assertNull($json['upload']);
        self::assertNotNull($json['source_vectordb']);
        self::assertCount(2, $json['processing_executions']);
    }

    public function testVanishedSourceVectorDbIsLeftOut(): void
    {
        EntrepotMockResponseFactory::failNext('GET stored_data/'.self::VECTORDB_ID, status: 404);

        $json = $this->pyramidDetails();

        self::assertNull($json['source_vectordb']);
        self::assertNotNull($json['upload']);
    }

    public function testVanishedExecutionIsDroppedAndOthersKept(): void
    {
        EntrepotMockResponseFactory::failNext('GET processings/executions/'.self::INTEGRATION_ID, status: 404);

        $json = $this->pyramidDetails();

        self::assertSame([self::PYRAMID_CREATION_ID], array_column($json['processing_executions'], '_id'));
    }

    public function testVanishedFileTreeIsEmpty(): void
    {
        EntrepotMockResponseFactory::failNext('GET uploads/'.self::UPLOAD_ID.'/tree', status: 404);

        $json = $this->pyramidDetails();

        self::assertSame([], $json['upload']['file_tree']);
        self::assertCount(4, $json['upload']['checks']);
    }

    public function testStoredDataWithoutLineageTags(): void
    {
        $client = $this->client();

        $client->xmlHttpRequest('GET', self::DATASTORE_PATH.'/stored_data/'.self::VECTORDB_ID.'/details');

        self::assertResponseIsSuccessful();
        $json = $this->jsonResponse($client);
        self::assertSame([], $json['stored_data']['tags']);
        self::assertNull($json['upload']);
        self::assertNull($json['source_vectordb']);
        self::assertSame([], $json['processing_executions']);
    }

    public function testOtherLineageErrorFailsThePage(): void
    {
        // 403 : un 5xx serait rejoué par le client HTTP
        EntrepotMockResponseFactory::failNext('GET uploads/'.self::UPLOAD_ID, status: 403);
        $client = $this->client();

        $client->xmlHttpRequest('GET', self::DATASTORE_PATH.'/stored_data/'.self::PYRAMID_ID.'/details');

        self::assertResponseStatusCodeSame(403);
    }

    public function testMissingStoredDataIsNotFound(): void
    {
        $client = $this->client();

        $client->xmlHttpRequest('GET', self::DATASTORE_PATH.'/stored_data/0f8fad5b-d9cb-469f-a165-70867728950e/details');

        self::assertResponseStatusCodeSame(404);
    }

    public function testUploadDetails(): void
    {
        $client = $this->client();

        $client->xmlHttpRequest('GET', self::DATASTORE_PATH.'/upload/'.self::UPLOAD_ID.'/details');

        self::assertResponseIsSuccessful();
        $json = $this->jsonResponse($client);
        self::assertSame('livraison', $json['name']);
        self::assertSame(['datasheet_name' => 'Fiche', 'zone' => 'France'], $json['tags']);
        self::assertCount(4, $json['checks']);
    }

    public function testDeletedUploadShowsTheSavedFileTree(): void
    {
        $fileTree = [['type' => 'FILE', 'name' => 'fichier.gpkg', 'size' => 12]];
        EntrepotMockResponseFactory::seed('uploads', ['_id' => 'b5d1c3f2-6a4e-4c8b-9f0a-2d7e1a3b4c5d', 'name' => 'supprimée', 'status' => 'DELETED', 'tags' => [], 'extra' => ['file_tree' => $fileTree]]);
        $client = $this->client();

        $client->xmlHttpRequest('GET', self::DATASTORE_PATH.'/upload/b5d1c3f2-6a4e-4c8b-9f0a-2d7e1a3b4c5d/details');

        self::assertResponseIsSuccessful();
        self::assertSame($fileTree, $this->jsonResponse($client)['file_tree']);
    }

    public function testMissingUploadIsNotFound(): void
    {
        $client = $this->client();

        $client->xmlHttpRequest('GET', self::DATASTORE_PATH.'/upload/0f8fad5b-d9cb-469f-a165-70867728950e/details');

        self::assertResponseStatusCodeSame(404);
        self::assertSame('NotFound', $this->jsonResponse($client)['details']['error']);
    }

    public function testExecutionLogs(): void
    {
        $client = $this->client();

        $client->xmlHttpRequest('GET', self::DATASTORE_PATH.'/stored_data/'.self::PYRAMID_ID.'/processing_executions/'.self::INTEGRATION_ID.'/logs');
        self::assertResponseIsSuccessful();
        self::assertSame(['journal de '.self::INTEGRATION_ID], $this->jsonResponse($client));

        $client->xmlHttpRequest('GET', self::DATASTORE_PATH.'/upload/'.self::UPLOAD_ID.'/check_executions/'.self::UPLOAD_ID.'/logs');
        self::assertResponseIsSuccessful();
        self::assertSame(['journal de '.self::UPLOAD_ID], $this->jsonResponse($client));
    }

    /** @return array<mixed> */
    private function pyramidDetails(): array
    {
        $client = $this->client();
        $client->xmlHttpRequest('GET', self::DATASTORE_PATH.'/stored_data/'.self::PYRAMID_ID.'/details');
        self::assertResponseIsSuccessful();

        return $this->jsonResponse($client);
    }

    private function client(): KernelBrowser
    {
        $client = self::createClient();
        $this->logIn($client);

        return $client;
    }
}
