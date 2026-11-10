<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Dto\Datasheet\DatasheetMetadataDTO;
use App\Dto\Datasheet\DatasheetServices;
use App\Dto\Datasheet\ProducerDTO;
use App\Dto\Datasheet\ResourceConditionDTO;
use App\Dto\Datasheet\SubConstraintDTO;
use App\Dto\Datasheet\TerritoryDTO;
use App\Dto\Metadata\CswLanguage;
use App\Dto\Metadata\CswMetadata;
use App\Dto\Metadata\CswOnlineResource;
use App\Dto\Metadata\CswOnlineResourceType;
use App\Security\KeycloakTokenManager;
use App\Services\CswMetadataXmlReader;
use App\Services\CswMetadataXmlWriter;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Orchestration de la fiche de métadonnées contre l’Entrepôt simulé (tests/Double/EntrepotMockResponseFactory.php).
 */
final class CartesMetadataApiServiceTest extends KernelTestCase
{
    private const DATASTORE_ID = EntrepotMockResponseFactory::DATASTORE_ID;
    // PNG de 1 × 1 pixel
    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    private CartesMetadataApiService $service;

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();

        // les appels à l’Entrepôt portent le jeton de l’utilisateur, lu dans la requête courante
        $request = new Request();
        $request->attributes->set((string) (new \ReflectionClassConstant(KeycloakTokenManager::class, 'REQUEST_ATTR_TOKEN'))->getValue(), FakeKeycloakClient::createAccessToken());
        self::getContainer()->get('request_stack')->push($request);

        $this->service = self::getContainer()->get(CartesMetadataApiService::class);
    }

    public function testCreationWritesAnUnpublishedMetadataTaggedWithTheDatasheetName(): void
    {
        $apiMetadata = $this->service->create(self::DATASTORE_ID, $this->dto(), null);

        self::assertSame(['datasheet_name' => 'Fiche'], $apiMetadata['tags']);
        $written = $this->readWritten($apiMetadata['_id']);
        self::assertSame('ign.fiche', $written->file_identifier);
        self::assertSame('Fiche', $written->name);
        self::assertSame([], $this->requestsTo('metadata/publication'));
    }

    public function testCreationOnAnExistingDatasheetNameAnswers409(): void
    {
        EntrepotMockResponseFactory::seed('uploads', ['_id' => 'upload-1', 'tags' => ['datasheet_name' => 'Fiche']]);

        $this->assertHttpError(409, fn () => $this->service->create(self::DATASTORE_ID, $this->dto(), null));
        self::assertSame([], EntrepotMockResponseFactory::stored('metadata'));
    }

    public function testCreationWithATakenFileIdentifierAnswers409BeforeUploadingTheThumbnail(): void
    {
        EntrepotMockResponseFactory::seed('metadata', ['_id' => 'metadata-autre', 'file_identifier' => 'ign.fiche', 'tags' => ['datasheet_name' => 'Autre']]);

        $this->assertHttpError(409, fn () => $this->service->create(self::DATASTORE_ID, $this->dto(), $this->thumbnail()));
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
    }

    public function testThumbnailIsRemovedWhenTheMetadataWriteFails(): void
    {
        EntrepotMockResponseFactory::failNext('POST metadata');

        $this->assertHttpError(500, fn () => $this->service->create(self::DATASTORE_ID, $this->dto(), $this->thumbnail()));
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
        self::assertCount(1, $this->requestsTo('annexes/annexe-1', 'DELETE'));
    }

    // une fiche de métadonnées sans étiquette resterait invisible et garderait son identifiant
    public function testUntaggedMetadataIsDeletedWhenTaggingFails(): void
    {
        EntrepotMockResponseFactory::failNext('POST metadata/metadata-1/tags');

        $this->assertHttpError(500, fn () => $this->service->create(self::DATASTORE_ID, $this->dto(), null));
        self::assertSame([], EntrepotMockResponseFactory::stored('metadata'));
    }

    public function testCreationWithAThumbnailWritesItsUrl(): void
    {
        $apiMetadata = $this->service->create(self::DATASTORE_ID, $this->dto(), $this->thumbnail());

        $annexes = EntrepotMockResponseFactory::stored('annexes');
        self::assertCount(1, $annexes);
        self::assertSame(['datasheet_name=Fiche', 'type=thumbnail'], $annexes[0]['labels']);
        self::assertStringEndsWith($annexes[0]['paths'][0], (string) $this->readWritten($apiMetadata['_id'])->thumbnail_url);
    }

    // fiche publiée en flux avant d’avoir une fiche de métadonnées : l’enregistrement du formulaire la crée
    public function testReplacementCreatesTheMissingMetadata(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'stored-1', 'type' => 'VECTOR-DB', 'tags' => ['datasheet_name' => 'Fiche']]);

        $apiMetadata = $this->service->replace(self::DATASTORE_ID, 'Fiche', $this->dto(), $this->noServices(), null, false);

        self::assertSame(['datasheet_name' => 'Fiche'], $apiMetadata['tags']);
        self::assertSame('Fiche', $this->readWritten($apiMetadata['_id'])->name);
    }

    public function testCreationFromReplacementKeepsTheExistingThumbnail(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'stored-1', 'type' => 'VECTOR-DB', 'tags' => ['datasheet_name' => 'Fiche']]);
        $this->seedOldThumbnail();

        $apiMetadata = $this->service->replace(self::DATASTORE_ID, 'Fiche', $this->dto(), $this->noServices(), null, false);

        self::assertStringEndsWith('thumbnail/ancienne.png', (string) $this->readWritten($apiMetadata['_id'])->thumbnail_url);
        self::assertSame(['annexe-ancienne'], array_column(EntrepotMockResponseFactory::stored('annexes'), '_id'));
    }

    public function testCreationFromReplacementReplacesTheExistingThumbnail(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'stored-1', 'type' => 'VECTOR-DB', 'tags' => ['datasheet_name' => 'Fiche']]);
        $this->seedOldThumbnail();

        $apiMetadata = $this->service->replace(self::DATASTORE_ID, 'Fiche', $this->dto(), $this->noServices(), $this->thumbnail(), false);

        $annexes = EntrepotMockResponseFactory::stored('annexes');
        self::assertCount(1, $annexes);
        self::assertNotSame('annexe-ancienne', $annexes[0]['_id']);
        self::assertStringEndsWith($annexes[0]['paths'][0], (string) $this->readWritten($apiMetadata['_id'])->thumbnail_url);
    }

    // nouvelle vignette écrite d’abord, ancienne supprimée ensuite
    public function testReplacementReplacesTheThumbnail(): void
    {
        $this->seedExistingMetadata();
        $this->seedOldThumbnail();

        $this->service->replace(self::DATASTORE_ID, 'Fiche', $this->dto(), $this->noServices(), $this->thumbnail(), false);

        $annexes = EntrepotMockResponseFactory::stored('annexes');
        self::assertCount(1, $annexes);
        self::assertNotSame('annexe-ancienne', $annexes[0]['_id']);
        self::assertStringEndsWith($annexes[0]['paths'][0], (string) $this->readWritten('metadata-1')->thumbnail_url);
    }

    public function testReplacementOfAnUnknownDatasheetAnswers404(): void
    {
        $this->assertHttpError(404, fn () => $this->service->replace(self::DATASTORE_ID, 'Fiche', $this->dto(), $this->noServices(), null, false));
    }

    public function testReplacementKeepsTheOnlineResourcesAndRefusesAnotherFileIdentifier(): void
    {
        $this->seedExistingMetadata();

        $this->service->replace(self::DATASTORE_ID, 'Fiche', $this->dto(description: 'Nouvelle description'), $this->noServices(), null, false);

        $written = $this->readWritten('metadata-1');
        self::assertSame('Nouvelle description', $written->description);
        self::assertCount(1, $written->resourcesOfType(CswOnlineResourceType::Layer));
        self::assertSame('https://annexes.example.test/ancienne.png', $written->thumbnail_url);

        $this->assertHttpError(400, fn () => $this->service->replace(self::DATASTORE_ID, 'Fiche', $this->dto(fileIdentifier: 'ign.autre'), $this->noServices(), null, false));
    }

    public function testReplacementDeletesTheThumbnailOnRequest(): void
    {
        $this->seedExistingMetadata();
        $this->seedOldThumbnail();

        $this->service->replace(self::DATASTORE_ID, 'Fiche', $this->dto(), $this->noServices(), null, true);

        self::assertNull($this->readWritten('metadata-1')->thumbnail_url);
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
    }

    // la publication d’un flux ne réécrit que les ressources en ligne, sans publier ni dépublier la fiche
    public function testRefreshRebuildsLayersWithoutPublishing(): void
    {
        $this->seedExistingMetadata();

        $this->service->refreshOnlineResources(self::DATASTORE_ID, 'Fiche', $this->noServices());

        $written = $this->readWritten('metadata-1');
        self::assertSame([], $written->resourcesOfType(CswOnlineResourceType::Layer));
        self::assertCount(1, $written->resourcesOfType(CswOnlineResourceType::Document));
        self::assertSame('Ancienne description', $written->description);
        self::assertSame([], $this->requestsTo('metadata/publication'));
        self::assertSame([], $this->requestsTo('metadata/publication', 'DELETE'));
    }

    public function testRefreshWithoutMetadataWritesNothing(): void
    {
        $this->service->refreshOnlineResources(self::DATASTORE_ID, 'Fiche', $this->noServices());

        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    private function seedOldThumbnail(): void
    {
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'annexe-ancienne', 'paths' => ['thumbnail/ancienne.png'], 'labels' => ['datasheet_name=Fiche', 'type=thumbnail']]);
    }

    private function seedExistingMetadata(): void
    {
        $metadata = new CswMetadata();
        $metadata->file_identifier = 'ign.fiche';
        $metadata->name = 'Fiche';
        $metadata->description = 'Ancienne description';
        $metadata->thumbnail_url = 'https://annexes.example.test/ancienne.png';
        $metadata->online_resources = [
            CswOnlineResource::layer('ns:couche', 'OGC:WFS', 'https://data.example.test/wfs', true),
            CswOnlineResource::document('Notice', null, 'https://annexes.example.test/notice.pdf'),
        ];

        EntrepotMockResponseFactory::seed(
            'metadata',
            ['_id' => 'metadata-1', 'file_identifier' => 'ign.fiche', 'tags' => ['datasheet_name' => 'Fiche'], 'endpoints' => []],
            self::getContainer()->get(CswMetadataXmlWriter::class)->toXml($metadata),
        );
    }

    private function readWritten(string $metadataId): CswMetadata
    {
        $xml = EntrepotMockResponseFactory::writtenMetadataFile($metadataId);
        self::assertNotNull($xml, "Aucun fichier écrit pour $metadataId");

        return self::getContainer()->get(CswMetadataXmlReader::class)->read($xml);
    }

    /** @return list<array{method: string, path: string, body: string}> */
    private function requestsTo(string $relativePath, string $method = 'POST'): array
    {
        $path = '/api/datastores/'.self::DATASTORE_ID.'/'.$relativePath;

        return array_values(array_filter(EntrepotMockResponseFactory::writeRequests(), fn (array $request) => $request['method'] === $method && $request['path'] === $path));
    }

    private function thumbnail(): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'vignette');
        file_put_contents($path, base64_decode(self::PNG, true));

        return new UploadedFile($path, 'vignette.png', 'image/png', null, true);
    }

    private function assertHttpError(int $status, \Closure $call): void
    {
        try {
            $call();
            self::fail("Une erreur $status était attendue");
        } catch (HttpException $e) {
            self::assertSame($status, $e->getStatusCode(), $e->getMessage());
        }
    }

    private function noServices(): DatasheetServices
    {
        return new DatasheetServices([], []);
    }

    private function dto(string $fileIdentifier = 'ign.fiche', string $description = 'Description'): DatasheetMetadataDTO
    {
        return new DatasheetMetadataDTO(
            name: 'Fiche',
            description: $description,
            themes: ['environment'],
            file_identifier: $fileIdentifier,
            producers: [new ProducerDTO('Organisme', 'orga@example.test', 'pointOfContact')],
            date_creation: '2026-01-15',
            update_frequency: 'monthly',
            territories: [new TerritoryDTO('COMMUNE_TEST_1', 'Commune test', [2.25, 48.8, 2.45, 48.9])],
            scale: 25000,
            resource_constraints: [new ResourceConditionDTO('other', [new SubConstraintDTO('useLimitation', description: 'Usage interne')])],
            hierarchy_level: 'dataset',
            language: CswLanguage::default(),
            charset: 'utf8',
        );
    }
}
