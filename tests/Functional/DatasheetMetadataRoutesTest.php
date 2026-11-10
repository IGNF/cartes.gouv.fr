<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Routes du formulaire de métadonnées : multipart (champ `data` et fichier `thumbnail`) et contrôle d’identifiant.
 */
final class DatasheetMetadataRoutesTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const DATASTORE_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID;

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
    }

    public function testCreationAnswers201WithTheWrittenMetadata(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DATASTORE_URL.'/datasheet', ['data' => json_encode(self::payload(), JSON_THROW_ON_ERROR)]);

        self::assertResponseStatusCodeSame(201);
        $json = $this->jsonResponse($client);
        self::assertSame('Fiche', $json['csw_metadata']['name']);
        self::assertSame(25000, $json['csw_metadata']['scale']);
    }

    public function testThumbnailOfAnotherTypeAnswers422OnTheThumbnailField(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $path = (string) tempnam(sys_get_temp_dir(), 'vignette');
        file_put_contents($path, 'pas une image');

        $client->xmlHttpRequest('POST', self::DATASTORE_URL.'/datasheet', ['data' => json_encode(self::payload(), JSON_THROW_ON_ERROR)], ['thumbnail' => new UploadedFile($path, 'vignette.png', 'image/png', null, true)]);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['thumbnail'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::stored('metadata'));
    }

    public function testThumbnailOver2MbAnswers422OnTheThumbnailField(): void
    {
        $client = self::createClient();
        $this->logIn($client);
        $path = (string) tempnam(sys_get_temp_dir(), 'vignette');
        // PNG valide suivi de 2 Mo de remplissage : le type passe, la taille non
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', true).str_repeat("\0", 2 * 1024 * 1024));

        $client->xmlHttpRequest('POST', self::DATASTORE_URL.'/datasheet', ['data' => json_encode(self::payload(), JSON_THROW_ON_ERROR)], ['thumbnail' => new UploadedFile($path, 'vignette.png', 'image/png', null, true)]);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['thumbnail'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
    }

    public function testFileIdentifierCheckAnswers204WhenFreeAnd409WhenTaken(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('HEAD', self::DATASTORE_URL.'/metadata?file_identifier=ign.fiche');
        self::assertResponseStatusCodeSame(204);

        EntrepotMockResponseFactory::seed('metadata', ['_id' => 'metadata-1', 'file_identifier' => 'ign.fiche', 'tags' => []]);
        $client->xmlHttpRequest('HEAD', self::DATASTORE_URL.'/metadata?file_identifier=ign.fiche');
        self::assertResponseStatusCodeSame(409);
    }

    /** @return array<string, mixed> */
    private static function payload(): array
    {
        return [
            'name' => 'Fiche',
            'description' => 'Description',
            'themes' => ['environment'],
            'file_identifier' => 'ign.fiche',
            'producers' => [['organization_name' => 'Organisme', 'organization_email' => 'orga@example.test', 'role' => 'pointOfContact']],
            'date_creation' => '2026-01-15',
            'update_frequency' => 'monthly',
            'territories' => [['id' => 'COMMUNE_TEST_1', 'title' => 'Commune test', 'bbox' => [2.25, 48.8, 2.45, 48.9]]],
            'scale' => 25000,
            'resource_constraints' => [['type' => 'other', 'constraints' => [['type' => 'useLimitation', 'description' => 'Usage interne']]]],
            'hierarchy_level' => 'dataset',
            'language' => ['code' => 'fre', 'language' => 'français'],
            'charset' => 'utf8',
        ];
    }
}
