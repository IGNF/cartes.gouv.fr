<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Déclaration de livraison du formulaire « Ajouter une donnée ».
 */
final class UploadAddRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const UPLOAD_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/upload/';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
    }

    public function testDeclarationCreatesTheUploadWithItsBusinessTags(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $this->post($client, $this->payload());

        self::assertResponseIsSuccessful();
        $upload = EntrepotMockResponseFactory::stored('uploads')[0];
        self::assertSame('ma_donnee', $upload['name']);
        self::assertSame('Description', $upload['description']);
        self::assertSame('EPSG:2154', $upload['srs']);
        self::assertEquals([
            'data_upload_path' => '0f8e3c2a-1b2c-4d5e-8f90-123456789abc/donnee.gpkg',
            'datasheet_name' => 'Fiche',
            'producer' => 'IGN',
            'production_year' => 2025,
            'date' => '2025-06-30',
            'theme' => 'Hydrographie, Transports',
            'zone' => 'D001 Ain',
            'email_notification' => true,
            'producer_short' => 'IGN',
        ], $upload['tags']);
    }

    public function testInvalidFieldsAnswer422FieldByFieldWithoutCallingTheEntrepot(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $this->post($client, ['name' => '1 nom invalide', 'themes' => [], 'production_date' => '2999-01-01'] + $this->payload());

        self::assertResponseStatusCodeSame(422);
        $paths = array_column(json_decode((string) $client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['violations'], 'propertyPath');
        sort($paths);
        self::assertSame(['name', 'production_date', 'themes'], $paths);
        self::assertSame([], EntrepotMockResponseFactory::stored('uploads'));
    }

    /** @param array<string, mixed> $payload */
    private function post(KernelBrowser $client, array $payload): void
    {
        $client->xmlHttpRequest('POST', self::UPLOAD_URL, [], [], ['CONTENT_TYPE' => 'application/json'], json_encode($payload, JSON_THROW_ON_ERROR));
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'datasheet_name' => 'Fiche',
            'data_upload_path' => '0f8e3c2a-1b2c-4d5e-8f90-123456789abc/donnee.gpkg',
            'name' => 'ma_donnee',
            'description' => 'Description',
            'srid' => 'EPSG:2154',
            'producer' => 'IGN',
            'producer_short' => ' IGN ',
            'themes' => ['Hydrographie', 'Transports'],
            'production_date' => '2025-06-30',
            'zone' => 'D001 Ain',
            'email_notification' => true,
        ];
    }
}
