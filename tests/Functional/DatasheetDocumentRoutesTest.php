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
}
