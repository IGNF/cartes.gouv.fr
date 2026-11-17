<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
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

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['type' => 'link', 'name' => 'Site', 'document' => 'https://example.test/']);

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
        $path = (string) tempnam(sys_get_temp_dir(), 'document');
        file_put_contents($path, '%PDF-1.4');

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['type' => 'file', 'name' => 'Rapport'], ['document' => new UploadedFile($path, 'rapport.pdf', 'application/pdf', null, true)]);

        self::assertResponseStatusCodeSame(409);
        self::assertSame('La liste des documents de cette fiche est bloquée. Contactez le support.', $this->jsonResponse($client)['detail']);
        self::assertSame(['liste'], array_column(EntrepotMockResponseFactory::stored('annexes'), '_id'));
    }

    public function testEditingWithoutListAnswers404(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('PATCH', self::DOCUMENTS_URL.'/lien-1', [], [], [], json_encode(['name' => 'Nom'], JSON_THROW_ON_ERROR));

        self::assertResponseStatusCodeSame(404);
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
    }
}
