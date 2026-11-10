<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\BrokenLockStore;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Lock\LockFactory;

/**
 * Intégration d’une livraison vecteur : lecture de l’état (GET) et avancement (POST).
 */
final class UploadIntegrationRoutesTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const UPLOAD_ID = 'upload-a';
    private const URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/upload/'.self::UPLOAD_ID.'/integration';
    private const UPLOADED_FILE = '0f8e3c2a-1b2c-4d5e-8f90-123456789abc/donnee.geojson';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
    }

    /**
     * @param array<mixed>                                                 $upload
     * @param array{status: string, next_action: ?string, steps: string[]} $expected
     *
     * @dataProvider states
     */
    public function testStateIsComputedOnReadWithoutWritingToTheEntrepot(array $upload, array $expected, ?string $executionStatus = null, ?string $storedDataStatus = null): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedUpload($upload);
        $this->dumpUploadedFile();
        if (null !== $executionStatus) {
            EntrepotMockResponseFactory::seed('processings/executions', ['_id' => 'execution-a', 'status' => $executionStatus]);
            EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'stored-data-a', 'status' => $storedDataStatus, 'tags' => []]);
        }

        $client->xmlHttpRequest('GET', self::URL);

        self::assertResponseIsSuccessful();
        $state = $this->jsonResponse($client);
        self::assertSame($expected['status'], $state['status']);
        self::assertSame($expected['next_action'], $state['next_action']);
        self::assertSame($expected['steps'], array_values($state['steps']));
        self::assertSame('Fiche', $state['datasheet_name']);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    /** @return iterable<string, array<mixed>> */
    public static function states(): iterable
    {
        $launched = ['status' => 'CLOSED', 'checks' => ['passed' => [['_id' => 'c']]], 'tags' => ['vectordb_id' => 'stored-data-a', 'proc_int_id' => 'execution-a']];

        yield 'fichier pas encore envoyé' => [['status' => 'OPEN'], ['status' => 'waiting', 'next_action' => 'send_files', 'steps' => ['waiting', 'waiting', 'waiting']]];
        yield 'vérifications en cours' => [['status' => 'CHECKING'], ['status' => 'in_progress', 'next_action' => null, 'steps' => ['successful', 'in_progress', 'waiting']]];
        // mesuré le 10/11/2026 : une vérification en échec laisse la livraison CLOSED
        yield 'vérification en échec' => [['status' => 'CLOSED', 'checks' => ['failed' => [['_id' => 'c']]]], ['status' => 'failed', 'next_action' => null, 'steps' => ['successful', 'failed', 'waiting']]];
        yield 'aucune vérification lancée' => [['status' => 'CLOSED'], ['status' => 'waiting', 'next_action' => null, 'steps' => ['successful', 'waiting', 'waiting']]];
        yield 'vérifications réussies' => [['status' => 'CLOSED', 'checks' => ['passed' => [['_id' => 'c']]]], ['status' => 'waiting', 'next_action' => 'launch_processing', 'steps' => ['successful', 'successful', 'waiting']]];
        yield 'traitement en cours' => [$launched, ['status' => 'in_progress', 'next_action' => null, 'steps' => ['successful', 'successful', 'in_progress']], 'PROGRESS', 'GENERATING'];
        yield 'traitement en échec' => [$launched, ['status' => 'failed', 'next_action' => null, 'steps' => ['successful', 'successful', 'failed']], 'FAILURE', 'UNSTABLE'];
        // tag posé à la main, sans exécution : pas de lecture de la donnée stockée
        yield 'vectordb_id seul' => [['status' => 'CLOSED', 'checks' => ['passed' => [['_id' => 'c']]], 'tags' => ['vectordb_id' => 'inconnue']], ['status' => 'failed', 'next_action' => null, 'steps' => ['successful', 'successful', 'failed']]];
        // mesuré le 10/11/2026 : une donnée stockée supprimée répond encore, avec le statut DELETED
        yield 'donnée stockée supprimée' => [$launched, ['status' => 'failed', 'next_action' => 'delete_upload', 'steps' => ['successful', 'successful', 'failed']], 'SUCCESS', 'DELETED'];
        yield 'donnée stockée générée' => [$launched, ['status' => 'successful', 'next_action' => 'delete_upload', 'steps' => ['successful', 'successful', 'successful']], 'SUCCESS', 'GENERATED'];
    }

    // le nettoyage quotidien de var/data a supprimé le fichier avant l'envoi
    public function testOpenUploadWithoutItsUploadedFileHasFailed(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedUpload(['status' => 'OPEN']);
        (new Filesystem())->remove($this->uploadedFilePath());

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseIsSuccessful();
        $state = $this->jsonResponse($client);
        self::assertSame('failed', $state['status']);
        self::assertNull($state['next_action']);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testAdvanceSendsTheUploadedFileThenClosesTheUpload(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedUpload(['status' => 'OPEN']);
        $path = $this->dumpUploadedFile();

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseIsSuccessful();
        self::assertSame('in_progress', $this->jsonResponse($client)['status']);
        self::assertSame(['data', 'md5', 'close'], array_map(static fn (array $request) => basename($request['path']), EntrepotMockResponseFactory::writeRequests()));
        self::assertFileDoesNotExist($path);
    }

    public function testAdvanceLaunchesTheProcessingAndTagsBothEntities(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedUpload(['status' => 'CLOSED', 'checks' => ['passed' => [['_id' => 'c']]]]);

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseIsSuccessful();
        $state = $this->jsonResponse($client);
        self::assertSame('in_progress', $state['status']);
        $storedData = EntrepotMockResponseFactory::stored('stored_data')[0];
        self::assertSame($storedData['_id'], $state['vectordb_id']);
        self::assertSame($storedData['_id'], EntrepotMockResponseFactory::stored('uploads')[0]['tags']['vectordb_id']);
        self::assertSame(['upload_id' => self::UPLOAD_ID, 'proc_int_id' => 'execution-2', 'datasheet_name' => 'Fiche'], $storedData['tags']);
        self::assertSame('WAITING', EntrepotMockResponseFactory::stored('processings/executions')[0]['status']);
    }

    /** @dataProvider failingLaunchCalls */
    public function testInterruptedLaunchIsUndone(string $failingCall): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedUpload(['status' => 'CLOSED', 'checks' => ['passed' => [['_id' => 'c']]]]);
        EntrepotMockResponseFactory::failNext($failingCall);

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('processings/executions'));
        self::assertSame([], EntrepotMockResponseFactory::stored('stored_data'));
        $tags = EntrepotMockResponseFactory::stored('uploads')[0]['tags'];
        self::assertArrayNotHasKey('vectordb_id', $tags);
        self::assertArrayNotHasKey('proc_int_id', $tags);
    }

    /** @return iterable<string, array{string}> */
    public static function failingLaunchCalls(): iterable
    {
        yield 'tags de la livraison' => ['POST uploads/'.self::UPLOAD_ID.'/tags'];
        yield 'tags de la donnée stockée' => ['POST stored_data/stored-data-1/tags'];
        yield 'lancement' => ['POST processings/executions/execution-2/launch'];
    }

    public function testInterruptedLaunchKeepsTheTagsWhenTheExecutionCannotBeDeleted(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedUpload(['status' => 'CLOSED', 'checks' => ['passed' => [['_id' => 'c']]]]);
        // lancement en erreur alors que l’Entrepôt l’a peut-être accepté : l’exécution ne se laisse plus supprimer
        EntrepotMockResponseFactory::failNext('POST processings/executions/execution-2/launch');
        EntrepotMockResponseFactory::failNext('DELETE processings/executions/execution-2');

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseStatusCodeSame(500);
        $tags = EntrepotMockResponseFactory::stored('uploads')[0]['tags'];
        self::assertSame('stored-data-1', $tags['vectordb_id']);
        self::assertSame('execution-2', $tags['proc_int_id']);
    }

    public function testAdvanceOnAnUnknownUploadAnswers404(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseStatusCodeSame(404);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testAdvanceRunsNothingWhileAnotherRequestHoldsTheLock(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedUpload(['status' => 'CLOSED', 'checks' => ['passed' => [['_id' => 'c']]]]);
        $lock = self::getContainer()->get('lock.factory')->createLock('upload_integration_'.self::UPLOAD_ID);
        self::assertTrue($lock->acquire());

        try {
            $client->xmlHttpRequest('POST', self::URL);
        } finally {
            $lock->release();
        }

        self::assertResponseIsSuccessful();
        self::assertSame('launch_processing', $this->jsonResponse($client)['next_action']);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testAdvanceAnswers503WhenTheLockStorageIsDown(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedUpload(['status' => 'CLOSED', 'checks' => ['passed' => [['_id' => 'c']]]]);
        // sans cela le noyau redémarre à la requête suivante et oublie le service remplacé
        $client->disableReboot();
        self::getContainer()->set('lock.default.factory', new LockFactory(new BrokenLockStore()));

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseStatusCodeSame(503);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testAdvanceDeletesTheUploadOnceItsStoredDataIsDeleted(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedLaunchedUpload('FAILURE', 'DELETED');

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseIsSuccessful();
        self::assertSame([], EntrepotMockResponseFactory::stored('uploads'));
    }

    // le rapport de la livraison reste consultable
    public function testAdvanceKeepsTheUploadOfAFailedStoredData(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedLaunchedUpload('FAILURE', 'UNSTABLE');

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseIsSuccessful();
        self::assertNull($this->jsonResponse($client)['next_action']);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testAdvanceDeletesTheUploadOnceTheStoredDataIsGenerated(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedGeneratedUpload();

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseIsSuccessful();
        $state = $this->jsonResponse($client);
        self::assertSame('successful', $state['status']);
        self::assertNull($state['next_action']);
        self::assertSame([], EntrepotMockResponseFactory::stored('uploads'));
    }

    public function testFailedDeletionKeepsTheIntegrationSuccessful(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $this->seedGeneratedUpload();
        EntrepotMockResponseFactory::failNext('DELETE uploads/'.self::UPLOAD_ID);

        $client->xmlHttpRequest('POST', self::URL);

        self::assertResponseIsSuccessful();
        self::assertSame('successful', $this->jsonResponse($client)['status']);
        self::assertCount(1, EntrepotMockResponseFactory::stored('uploads'));
    }

    private function uploadedFilePath(): string
    {
        return self::getContainer()->getParameter('upload_path').'/'.self::UPLOADED_FILE;
    }

    private function dumpUploadedFile(): string
    {
        $path = $this->uploadedFilePath();
        (new Filesystem())->dumpFile($path, '{"type":"FeatureCollection","features":[]}');

        return $path;
    }

    /** @param array<mixed> $upload */
    private function seedUpload(array $upload): void
    {
        $tags = ($upload['tags'] ?? []) + ['datasheet_name' => 'Fiche', 'data_upload_path' => self::UPLOADED_FILE];
        EntrepotMockResponseFactory::seed('uploads', ['tags' => $tags] + $upload + ['_id' => self::UPLOAD_ID, 'name' => 'ma_donnee']);
    }

    private function seedGeneratedUpload(): void
    {
        $this->seedLaunchedUpload('SUCCESS', 'GENERATED');
    }

    private function seedLaunchedUpload(string $executionStatus, string $storedDataStatus): void
    {
        $this->seedUpload(['status' => 'CLOSED', 'checks' => ['passed' => [['_id' => 'c']]], 'tags' => ['vectordb_id' => 'stored-data-a', 'proc_int_id' => 'execution-a']]);
        EntrepotMockResponseFactory::seed('processings/executions', ['_id' => 'execution-a', 'status' => $executionStatus]);
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'stored-data-a', 'status' => $storedDataStatus, 'tags' => []]);
    }
}
