<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Publication d’un flux WFS depuis le nouveau formulaire : multipart avec le champ `data` et les fichiers `thumbnail`, `attribution_logo`.
 */
final class WfsPublishRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const PUBLISH_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/stored_data/vectordb-1/wfs/publish';
    private const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'vectordb-1', 'type' => 'VECTOR-DB', 'tags' => ['datasheet_name' => 'Fiche']]);
    }

    public function testPublicFluxIsCreatedWithItsTagsMetadataLinksAndNoPermission(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->post($client, $this->payload());

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        self::assertSame('SANDBOX.mon_flux', $configuration['layer_name']);
        self::assertSame('Mon flux', $configuration['name']);
        self::assertSame(['datasheet_name' => 'Fiche', 'theme' => 'Hydrographie, Transports'], $configuration['tags']);
        self::assertSame([[
            'relations' => [['native_name' => 'communes', 'public_name' => 'communes', 'title' => 'Communes', 'abstract' => 'Les communes', 'keywords' => ['Unités administratives']]],
            'stored_data' => 'vectordb-1',
        ]], $configuration['type_infos']['used_data']);
        self::assertSame('https://catalogue.test/dataset/ign.fiche', $configuration['metadata'][1]['url']);
        self::assertArrayNotHasKey('attribution', $configuration);
        self::assertArrayNotHasKey('extra', $configuration);
        self::assertSame(EntrepotMockResponseFactory::WFS_PUBLIC_ENDPOINT_ID, EntrepotMockResponseFactory::stored('offerings')[0]['endpoint']['_id']);
        self::assertSame([], EntrepotMockResponseFactory::stored('permissions'));
    }

    public function testThumbnailAndLogoAreStoredAsAnnexesAndReferencedByTheConfiguration(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->post($client, ['attribution' => ['title' => 'IGN', 'url' => 'https://www.ign.fr']] + $this->payload(), [
            'thumbnail' => $this->png('vignette.png'),
            'attribution_logo' => $this->png('logo.png'),
        ]);

        self::assertResponseStatusCodeSame(201);
        $annexes = EntrepotMockResponseFactory::stored('annexes');
        self::assertCount(2, $annexes);
        self::assertContains('type=service-thumbnail', $annexes[0]['labels']);
        self::assertContains('type=attribution-logo', $annexes[1]['labels']);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        self::assertSame('https://entrepot.test/annexes/entrepot_test'.$annexes[0]['paths'][0], $configuration['extra']['_search']['url_vignette']);
        self::assertSame(['title' => 'IGN', 'url' => 'https://www.ign.fr', 'logo' => [
            'url' => 'https://entrepot.test/annexes/entrepot_test'.$annexes[1]['paths'][0],
            'width' => 1,
            'height' => 1,
            'format' => 'image/png',
        ]], $configuration['attribution']);
    }

    public function testRestrictedVisibleFluxGivesPermissionsToTheDatastoreAndCartesGouvCommunities(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->post($client, ['access' => 'restricted_visible'] + $this->payload());

        self::assertResponseStatusCodeSame(201);
        self::assertSame(EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID, EntrepotMockResponseFactory::stored('offerings')[0]['endpoint']['_id']);
        self::assertSame(
            ['community-1', self::getContainer()->getParameter('config')['community_id']],
            array_map(fn (array $permission) => $permission['beneficiary']['_id'], EntrepotMockResponseFactory::stored('permissions')),
        );
    }

    public function testRestrictedFluxGivesAPermissionToTheDatastoreCommunityOnly(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->post($client, ['access' => 'restricted'] + $this->payload());

        self::assertResponseStatusCodeSame(201);
        self::assertSame(['community-1'], array_map(fn (array $permission) => $permission['beneficiary']['_id'], EntrepotMockResponseFactory::stored('permissions')));
    }

    public function testDatasheetWithoutMetadataAnswers400WithoutWriting(): void
    {
        $client = $this->client();

        $this->post($client, $this->payload());

        self::assertResponseStatusCodeSame(400);
        self::assertSame('Renseignez d’abord la description de la fiche de données', $this->jsonResponse($client)['detail']);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testInvalidFieldsAnswer422WithTheirPaths(): void
    {
        $client = $this->client();

        $this->post($client, ['technical_name' => 'nom invalide', 'tables' => [], 'access' => 'partout', 'attribution' => ['title' => '', 'url' => 'pas une url']] + $this->payload());

        self::assertResponseStatusCodeSame(422);
        $paths = array_column($this->jsonResponse($client)['violations'], 'propertyPath');
        sort($paths);
        self::assertSame(['access'], $paths, 'une valeur hors énumération est refusée avant toute autre validation');

        $this->post($client, ['technical_name' => 'nom invalide', 'tables' => [], 'attribution' => ['title' => '', 'url' => 'pas une url']] + $this->payload());

        self::assertResponseStatusCodeSame(422);
        $paths = array_column($this->jsonResponse($client)['violations'], 'propertyPath');
        sort($paths);
        self::assertSame(['attribution.title', 'attribution.url', 'tables', 'technical_name'], $paths);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testImageOfAnotherTypeAnswers422OnItsField(): void
    {
        $client = $this->client();
        $path = (string) tempnam(sys_get_temp_dir(), 'logo');
        file_put_contents($path, 'pas une image');

        $this->post($client, $this->payload(), ['attribution_logo' => new UploadedFile($path, 'logo.png', 'image/png', null, true)]);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['attribution_logo'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
    }

    public function testUnreadableImageWithAPngSignatureAnswers422(): void
    {
        $client = $this->client();
        $path = (string) tempnam(sys_get_temp_dir(), 'vignette');
        // signature PNG suivie de contenu illisible : le type détecté est bon, les dimensions non
        file_put_contents($path, "\x89PNG\r\n\x1a\n".str_repeat('x', 64));

        $this->post($client, $this->payload(), ['thumbnail' => new UploadedFile($path, 'vignette.png', 'image/png', null, true)]);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['thumbnail'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
    }

    public function testAnnexesAreRemovedWhenTheConfigurationCannotBeCreated(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('POST configurations');

        $this->post($client, $this->payload(), ['thumbnail' => $this->png('vignette.png')]);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
    }

    public function testConfigurationIsRemovedWhenTheOfferingCannotBeCreated(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('POST configurations/configuration-1/offerings');

        $this->post($client, $this->payload());

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
    }

    private function client(): KernelBrowser
    {
        $client = self::createClient();
        $this->logIn($client);

        return $client;
    }

    private function seedMetadata(): void
    {
        EntrepotMockResponseFactory::seed(
            'metadata',
            ['_id' => 'metadata-1', 'file_identifier' => 'ign.fiche', 'tags' => ['datasheet_name' => 'Fiche'], 'endpoints' => []],
            (string) file_get_contents(__DIR__.'/../Fixture/metadata/expected-minimal.xml'),
        );
    }

    private function png(string $name): UploadedFile
    {
        $path = (string) tempnam(sys_get_temp_dir(), 'image');
        file_put_contents($path, base64_decode(self::PNG_1X1, true));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    /**
     * @param array<string, mixed>        $payload
     * @param array<string, UploadedFile> $files
     */
    private function post(KernelBrowser $client, array $payload, array $files = []): void
    {
        $client->xmlHttpRequest('POST', self::PUBLISH_URL, ['data' => json_encode($payload, JSON_THROW_ON_ERROR)], $files);
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'title' => 'Mon flux',
            'technical_name' => 'SANDBOX.mon_flux',
            'themes' => ['Hydrographie', 'Transports'],
            'access' => 'public',
            'attribution' => null,
            'tables' => [[
                'native_name' => 'communes',
                'title' => 'Communes',
                'public_name' => 'communes',
                'description' => 'Les communes',
                'keywords' => ['Unités administratives'],
            ]],
        ];
    }
}
