<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Documents d’une fiche (onglet Annexes) : liste portée par une annexe JSON étiquetée.
 */
final class DatasheetDocumentRoutesTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const DOCUMENTS_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/datasheet/Fiche/documents';
    private const LIST_LABELS = ['datasheet_name=Fiche', 'type=document-list'];

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
    }

    public function testReadingWithoutListCreatesNothing(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::DOCUMENTS_URL);

        self::assertResponseIsSuccessful();
        self::assertSame([], $this->jsonResponse($client));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    // étiquettes posées par le POST : pas de fenêtre où l’annexe existe sans être trouvable
    public function testFirstWriteCreatesTheListWithItsLabels(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['type' => 'link', 'name' => 'Site', 'url' => 'https://example.test/']);

        self::assertResponseIsSuccessful();
        $annexes = EntrepotMockResponseFactory::stored('annexes');
        self::assertCount(1, $annexes);
        self::assertSame(self::LIST_LABELS, $annexes[0]['labels']);
        self::assertSame([], array_filter(EntrepotMockResponseFactory::writeRequests(), fn (array $request) => 'PATCH' === $request['method']));
        self::assertSame(['Site'], array_column(json_decode((string) EntrepotMockResponseFactory::annexeFile($annexes[0]['_id']), true, flags: JSON_THROW_ON_ERROR), 'name'));
        self::assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/', $this->jsonResponse($client)[0]['creation']);
    }

    public function testDuplicatedListsReadTheOldest(): void
    {
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'liste-recente', 'paths' => ['documents/Fiche.json'], 'labels' => self::LIST_LABELS, 'creation' => '2026-11-09T10:00:00Z']);
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'liste-ancienne', 'paths' => ['documents/Fiche.json'], 'labels' => self::LIST_LABELS, 'creation' => '2026-01-01T10:00:00Z']);
        EntrepotMockResponseFactory::seedAnnexeFile('liste-recente', '[]');
        EntrepotMockResponseFactory::seedAnnexeFile('liste-ancienne', json_encode([['id' => 'lien-1', 'type' => 'link', 'name' => 'Ancien', 'url' => 'https://example.test/']], JSON_THROW_ON_ERROR));
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('GET', self::DOCUMENTS_URL);

        self::assertSame(['Ancien'], array_column($this->jsonResponse($client), 'name'));
    }

    // verrou de l’Entrepôt sur la liste : message clair et pas de fichier orphelin
    public function testLockedListAnswersAClearConflict(): void
    {
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'liste', 'paths' => ['documents/Fiche.json'], 'labels' => self::LIST_LABELS, 'creation' => '2026-01-01T10:00:00Z']);
        EntrepotMockResponseFactory::seedAnnexeFile('liste', '[]');
        EntrepotMockResponseFactory::failNext('PUT annexes/liste', 0, 409);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['type' => 'file', 'name' => 'Rapport'], ['file' => $this->upload('rapport.pdf', "%PDF-1.4\n%%EOF")]);

        self::assertResponseStatusCodeSame(409);
        self::assertSame('La liste des documents de cette fiche est bloquée. Contactez le support.', $this->jsonResponse($client)['detail']);
        self::assertSame(['liste'], array_column(EntrepotMockResponseFactory::stored('annexes'), '_id'));
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public static function acceptedFiles(): iterable
    {
        yield 'pdf' => ['rapport.pdf', "%PDF-1.4\n%%EOF"];
        yield 'png' => ['image.png', (string) base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', true)];
        yield 'svg' => ['image.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>'];
        yield 'csv' => ['table.csv', "id;nom\n1;Ardennes\n"];
        yield 'qgz' => ['projet.qgz', "PK\x05\x06".str_repeat("\0", 18)];
    }

    #[DataProvider('acceptedFiles')]
    public function testAcceptedFormats(string $fileName, string $content): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['type' => 'file', 'name' => 'Document'], ['file' => $this->upload($fileName, $content)]);

        self::assertResponseIsSuccessful();
        self::assertCount(2, EntrepotMockResponseFactory::stored('annexes'));
    }

    /**
     * @return iterable<string, array{array<string, string>, array<string, array{string, string}>, string}>
     */
    public static function invalidDocuments(): iterable
    {
        yield 'type inconnu' => [['type' => 'video', 'name' => 'Nom'], [], 'type'];
        yield 'nom vide' => [['type' => 'link', 'name' => ' ', 'url' => 'https://example.test/'], [], 'name'];
        yield 'lien javascript' => [['type' => 'link', 'name' => 'Nom', 'url' => 'javascript:alert(1)'], [], 'url'];
        yield 'lien absent' => [['type' => 'link', 'name' => 'Nom'], [], 'url'];
        yield 'lien vide' => [['type' => 'link', 'name' => 'Nom', 'url' => ''], [], 'url'];
        yield 'lien sans nom de domaine' => [['type' => 'link', 'name' => 'Nom', 'url' => 'http://localhost/'], [], 'url'];
        yield 'fichier absent' => [['type' => 'file', 'name' => 'Nom'], [], 'file'];
        yield 'extension refusée' => [['type' => 'file', 'name' => 'Nom'], ['file' => ['page.html', '<html></html>']], 'file'];
        yield 'contenu qui ne correspond pas' => [['type' => 'file', 'name' => 'Nom'], ['file' => ['faux.pdf', '<html></html>']], 'file'];
        yield 'plus de 5 Mo' => [['type' => 'file', 'name' => 'Nom'], ['file' => ['gros.csv', str_repeat("a;b\n", 1_400_000)]], 'file'];
    }

    /**
     * @param array<string, string>                $fields
     * @param array<string, array{string, string}> $files
     */
    #[DataProvider('invalidDocuments')]
    public function testInvalidDocumentAnswers422WithoutWriting(array $fields, array $files, string $field): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, $fields, array_map(fn (array $file) => $this->upload(...$file), $files));

        self::assertResponseStatusCodeSame(422);
        self::assertSame([$field], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testEditingWithAnEmptyNameAnswers422(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL.'/lien-1', ['name' => '']);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['name'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
    }

    public function testALinkWithAnAttachedFileAnswers422(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['type' => 'link', 'name' => 'Site', 'url' => 'https://example.test/'], ['file' => $this->upload('rapport.pdf', "%PDF-1.4\n%%EOF")]);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['file'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    // nouvelle annexe pour le nouveau fichier, puis suppression de l’ancienne ; la description disparaît
    public function testReplacingAFileMovesTheDocumentToANewAnnexe(): void
    {
        $this->seedList([['id' => 'fichier-1', 'type' => 'file', 'name' => 'Ancien', 'description' => 'à retirer', 'url' => 'https://entrepot.test/ancien.pdf', 'file_name' => 'ancien.pdf', 'creation' => '2026-09-28T11:04:00+00:00']]);
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'fichier-1', 'paths' => ['documents/Fiche/x/ancien.pdf'], 'labels' => ['datasheet_name=Fiche', 'type=document']]);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL.'/fichier-1', ['name' => 'Carte'], ['file' => $this->upload('carte.png', (string) base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', true))]);

        self::assertResponseIsSuccessful();
        [$document] = $this->jsonResponse($client);
        self::assertNotSame('fichier-1', $document['id']);
        self::assertSame('Carte', $document['name']);
        self::assertStringEndsWith('/carte.png', $document['url']);
        self::assertSame('carte.png', $document['file_name']);
        self::assertArrayNotHasKey('description', $document);
        self::assertSame('2026-09-28T11:04:00+00:00', $document['creation']);
        self::assertSame(['liste', $document['id']], array_column(EntrepotMockResponseFactory::stored('annexes'), '_id'));
    }

    public function testEditingALinkChangesItsUrl(): void
    {
        $this->seedList([['id' => 'lien-1', 'type' => 'link', 'name' => 'Site', 'url' => 'https://ancien.test/']]);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL.'/lien-1', ['name' => 'Site', 'url' => 'https://nouveau.test/']);

        self::assertResponseIsSuccessful();
        self::assertSame('https://nouveau.test/', $this->jsonResponse($client)[0]['url']);
    }

    /**
     * @return iterable<string, array{array<string, mixed>, array<string, string>, bool, string}>
     */
    public static function mismatchedEdits(): iterable
    {
        yield 'URL d’un fichier' => [['id' => 'doc-1', 'type' => 'file', 'name' => 'Rapport', 'url' => 'https://entrepot.test/rapport.pdf'], ['name' => 'Rapport', 'url' => 'https://example.test/'], false, 'url'];
        yield 'fichier d’un lien' => [['id' => 'doc-1', 'type' => 'link', 'name' => 'Site', 'url' => 'https://example.test/'], ['name' => 'Site'], true, 'file'];
    }

    /**
     * @param array<string, mixed>  $document
     * @param array<string, string> $fields
     */
    #[DataProvider('mismatchedEdits')]
    public function testEditMustMatchTheDocumentType(array $document, array $fields, bool $withFile, string $field): void
    {
        $this->seedList([$document]);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL.'/doc-1', $fields, $withFile ? ['file' => $this->upload('rapport.pdf', "%PDF-1.4\n%%EOF")] : []);

        self::assertResponseStatusCodeSame(422);
        self::assertSame([$field], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertCount(1, EntrepotMockResponseFactory::stored('annexes'));
    }

    public function testEditingAnUnknownDocumentAnswers404(): void
    {
        $this->seedList([]);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL.'/inconnu', ['name' => 'Nom']);

        self::assertResponseStatusCodeSame(404);
    }

    // deux premiers ajouts simultanés : la liste la plus ancienne garde le document, la nôtre est retirée
    public function testConcurrentFirstWritesKeepOneList(): void
    {
        EntrepotMockResponseFactory::createConcurrentlyWithNextAnnexe(['_id' => 'liste-concurrente', 'paths' => ['documents/Fiche.json'], 'labels' => self::LIST_LABELS, 'creation' => '2026-01-01T10:00:00Z'], '[]');
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['type' => 'link', 'name' => 'Site', 'url' => 'https://example.test/']);

        self::assertResponseIsSuccessful();
        self::assertSame(['liste-concurrente'], array_column(EntrepotMockResponseFactory::stored('annexes'), '_id'));
        self::assertSame(['Site'], array_column(json_decode((string) EntrepotMockResponseFactory::annexeFile('liste-concurrente'), true, flags: JSON_THROW_ON_ERROR), 'name'));
    }

    public function testFilePathIsNormalized(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['type' => 'file', 'name' => 'Budget'], ['file' => $this->upload('Budget, 2026 100% été.PDF', "%PDF-1.4\n%%EOF")]);

        self::assertResponseIsSuccessful();
        [$document] = $this->jsonResponse($client);
        self::assertMatchesRegularExpression('#documents/fiche/[0-9a-f-]{36}/budget-2026-100-ete\.pdf$#', $document['url']);
        self::assertSame('Budget, 2026 100% été.PDF', $document['file_name']);
    }

    public function testFileNameWithoutLettersKeepsAPathName(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['type' => 'file', 'name' => 'Symboles'], ['file' => $this->upload('%%%.pdf', "%PDF-1.4\n%%EOF")]);

        self::assertResponseIsSuccessful();
        self::assertMatchesRegularExpression('#/[0-9a-f-]{36}/document\.pdf$#', $this->jsonResponse($client)[0]['url']);
    }

    public function testUrlWithoutDomainHasAFrenchMessage(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['type' => 'link', 'name' => 'Nom', 'url' => 'http://192.168.1.1/']);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['L’URL du lien doit contenir un nom de domaine'], array_column($this->jsonResponse($client)['violations'], 'title'));
    }

    public function testEditingALinkWithAnEmptyUrlAnswers422(): void
    {
        $this->seedList([['id' => 'lien-1', 'type' => 'link', 'name' => 'Site', 'url' => 'https://example.test/']]);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL.'/lien-1', ['name' => 'Site', 'url' => '']);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['url'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
    }

    public function testDeletingAFileRemovesItsAnnexeAfterTheList(): void
    {
        $this->seedList([['id' => 'fichier-1', 'type' => 'file', 'name' => 'Rapport', 'url' => 'https://entrepot.test/rapport.pdf']]);
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'fichier-1', 'paths' => ['documents/fiche/x/rapport.pdf'], 'labels' => ['datasheet_name=Fiche', 'type=document']]);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('DELETE', self::DOCUMENTS_URL.'/fichier-1');

        self::assertResponseStatusCodeSame(204);
        self::assertSame(['liste'], array_column(EntrepotMockResponseFactory::stored('annexes'), '_id'));
        self::assertSame('[]', EntrepotMockResponseFactory::annexeFile('liste'));
    }

    // liste non écrite : le fichier reste, une nouvelle tentative peut aboutir
    public function testDeletingWithALockedListKeepsTheFile(): void
    {
        $this->seedList([['id' => 'fichier-1', 'type' => 'file', 'name' => 'Rapport', 'url' => 'https://entrepot.test/rapport.pdf']]);
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'fichier-1', 'paths' => ['documents/fiche/x/rapport.pdf'], 'labels' => ['datasheet_name=Fiche', 'type=document']]);
        EntrepotMockResponseFactory::failNext('PUT annexes/liste', 0, 409);
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('DELETE', self::DOCUMENTS_URL.'/fichier-1');

        self::assertResponseStatusCodeSame(409);
        self::assertSame(['liste', 'fichier-1'], array_column(EntrepotMockResponseFactory::stored('annexes'), '_id'));
    }

    public function testEditingWithoutListAnswers404(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL.'/lien-1', ['name' => 'Nom']);

        self::assertResponseStatusCodeSame(404);
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
    }

    private function upload(string $fileName, string $content): UploadedFile
    {
        $path = (string) tempnam(sys_get_temp_dir(), 'document');
        file_put_contents($path, $content);

        return new UploadedFile($path, $fileName, null, null, true);
    }

    /**
     * @param list<array<string, mixed>> $documents
     */
    private function seedList(array $documents): void
    {
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'liste', 'paths' => ['documents/Fiche.json'], 'labels' => self::LIST_LABELS, 'creation' => '2026-01-01T10:00:00Z']);
        EntrepotMockResponseFactory::seedAnnexeFile('liste', json_encode($documents, JSON_THROW_ON_ERROR));
    }
}
