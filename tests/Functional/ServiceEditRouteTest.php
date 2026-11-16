<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Modification d’un flux depuis sa page : multipart avec le champ `data` et les fichiers `thumbnail`, `attribution_logo`.
 */
final class ServiceEditRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const OFFERING_ID = '5d3c1b2a-8e7f-4a6b-9c0d-1e2f3a4b5c6d';
    private const CONFIGURATION_ID = 'configuration-edit';
    private const ANNEXES_URL = 'https://entrepot.test/annexes/entrepot_test';
    private const OLD_THUMBNAIL_PATH = '/thumbnail/0f9e8d7c-6b5a-4c3d-8e1f-a0b1c2d3e4f5.png';
    private const OLD_LOGO_PATH = '/attribution-logo/1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d.png';
    // style déjà migré : getStyles ne le réécrit pas
    private const STYLE = ['name' => 'Mon style', 'technical_name' => 'mon_style', 'layers' => []];
    private const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed(
            'metadata',
            ['_id' => 'metadata-1', 'file_identifier' => 'ign.fiche', 'tags' => ['datasheet_name' => 'Fiche'], 'endpoints' => []],
            (string) file_get_contents(__DIR__.'/../Fixture/metadata/expected-minimal.xml'),
        );
        foreach ([self::OLD_THUMBNAIL_PATH => 'service-thumbnail', self::OLD_LOGO_PATH => 'attribution-logo'] as $path => $type) {
            EntrepotMockResponseFactory::seed('annexes', ['_id' => 'annexe-'.$type, 'paths' => [$path], 'labels' => ['datasheet_name=Fiche', "type=$type"]]);
        }
    }

    public function testWfsConfigurationIsReplacedWithoutLayerNameAndWithRebuiltRelations(): void
    {
        $this->seedService('WFS');
        $client = $this->client();

        $this->post($client, ['tables' => [
            ['native_name' => 'routes', 'title' => 'Routes', 'public_name' => '', 'description' => 'Les routes', 'keywords' => []],
        ]] + $this->payload());

        self::assertResponseIsSuccessful();
        $put = $this->configurationPut();
        self::assertArrayNotHasKey('layer_name', $put);
        self::assertSame('Flux modifié', $put['name']);
        self::assertSame([[
            'stored_data' => 'vectordb-1',
            'relations' => [['native_name' => 'routes', 'title' => 'Routes', 'abstract' => 'Les routes']],
        ]], $put['type_infos']['used_data']);
        self::assertTrue($put['type_infos']['expose_primary_key']);
        self::assertSame($this->seededConfiguration('WFS')['metadata'], $put['metadata']);

        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        self::assertSame('SANDBOX.mon_flux', $configuration['layer_name']);
        self::assertSame('Hydrographie, Transports', $configuration['tags']['theme']);
        self::assertSame(self::OFFERING_ID, EntrepotMockResponseFactory::stored('offerings')[0]['_id']);
        self::assertContains(['method' => 'PUT', 'path' => '/api/datastores/ds-1/offerings/'.self::OFFERING_ID, 'body' => ''], EntrepotMockResponseFactory::writeRequests());
    }

    /**
     * @return iterable<string, array{string}>
     */
    public static function pyramidTypes(): iterable
    {
        yield 'WMS raster' => ['WMS-RASTER'];
        yield 'WMTS ou TMS' => ['WMTS-TMS'];
    }

    #[DataProvider('pyramidTypes')]
    public function testPyramidTypeInfosGetTheTitleDescriptionAndThemes(string $type): void
    {
        $this->seedService($type);
        $client = $this->client();

        $this->post($client, ['description' => 'Nouvelle description'] + $this->payload());

        self::assertResponseIsSuccessful();
        self::assertSame([
            'used_data' => [['stored_data' => 'pyramid-1', 'bottom_level' => '18', 'top_level' => '5']],
            'styles' => ['static-legend'],
            'title' => 'Flux modifié',
            'abstract' => 'Nouvelle description',
            'keywords' => ['Hydrographie', 'Transports'],
        ], $this->configurationPut()['type_infos']);
    }

    public function testNewLogoReplacesTheOldOneWhichIsRemovedAfterwards(): void
    {
        $this->seedService('WFS');
        $client = $this->client();

        $this->post($client, ['attribution' => ['title' => 'IGN', 'url' => 'https://www.ign.fr']] + $this->payload(), ['attribution_logo' => $this->png()]);

        self::assertResponseIsSuccessful();
        $logoUrl = $this->configurationPut()['attribution']['logo']['url'];
        self::assertStringStartsWith(self::ANNEXES_URL.'/attribution-logo/', $logoUrl);
        self::assertNotSame(self::ANNEXES_URL.self::OLD_LOGO_PATH, $logoUrl);
        self::assertSame(['annexe-service-thumbnail'], $this->remainingSeededAnnexes());
    }

    public function testOldLogoIsKeptWithoutANewFileAndRemovedOnRequest(): void
    {
        $this->seedService('WFS');
        $client = $this->client();

        $this->post($client, ['attribution' => ['title' => 'IGN', 'url' => 'https://www.ign.fr']] + $this->payload());

        self::assertResponseIsSuccessful();
        self::assertSame(self::ANNEXES_URL.self::OLD_LOGO_PATH, $this->configurationPut()['attribution']['logo']['url']);
        self::assertSame(['annexe-service-thumbnail', 'annexe-attribution-logo'], $this->remainingSeededAnnexes());

        $this->post($client, ['attribution' => ['title' => 'IGN', 'url' => 'https://www.ign.fr'], 'remove_attribution_logo' => true] + $this->payload());

        self::assertResponseIsSuccessful();
        self::assertSame(['title' => 'IGN', 'url' => 'https://www.ign.fr'], $this->configurationPut()['attribution']);
        self::assertSame(['annexe-service-thumbnail'], $this->remainingSeededAnnexes());
    }

    public function testUncheckedAttributionRemovesTheAttributionAndItsLogo(): void
    {
        $this->seedService('WFS');
        $client = $this->client();

        $this->post($client, $this->payload());

        self::assertResponseIsSuccessful();
        self::assertArrayNotHasKey('attribution', $this->configurationPut());
        self::assertArrayNotHasKey('attribution', EntrepotMockResponseFactory::stored('configurations')[0]);
        self::assertSame(['annexe-service-thumbnail'], $this->remainingSeededAnnexes());
    }

    public function testThumbnailRemovalKeepsTheOtherExtraKeys(): void
    {
        $this->seedService('WFS');
        $client = $this->client();

        $this->post($client, ['remove_thumbnail' => true] + $this->payload());

        self::assertResponseIsSuccessful();
        self::assertSame(['styles' => [self::STYLE], '_search' => ['autre' => 'valeur']], EntrepotMockResponseFactory::stored('configurations')[0]['extra']);
        self::assertSame([], $this->remainingSeededAnnexes());
    }

    public function testNewThumbnailReplacesTheOldOne(): void
    {
        $this->seedService('WFS');
        $client = $this->client();

        $this->post($client, $this->payload(), ['thumbnail' => $this->png()]);

        self::assertResponseIsSuccessful();
        $extra = EntrepotMockResponseFactory::stored('configurations')[0]['extra'];
        self::assertStringStartsWith(self::ANNEXES_URL.'/thumbnail/', $extra['_search']['url_vignette']);
        self::assertNotSame(self::ANNEXES_URL.self::OLD_THUMBNAIL_PATH, $extra['_search']['url_vignette']);
        self::assertSame([self::STYLE], $extra['styles']);
    }

    public function testNewAnnexesAreRemovedWhenTheConfigurationCannotBeReplaced(): void
    {
        $this->seedService('WFS');
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('PUT configurations/'.self::CONFIGURATION_ID);

        $this->post($client, $this->payload(), ['thumbnail' => $this->png()]);

        self::assertResponseStatusCodeSame(500);
        self::assertSame(['annexe-service-thumbnail', 'annexe-attribution-logo'], array_column(EntrepotMockResponseFactory::stored('annexes'), '_id'));
    }

    public function testPublicToRestrictedVisibleRecreatesTheOfferingOnThePrivateEndpoint(): void
    {
        $this->seedService('WFS');
        $client = $this->client();

        $this->post($client, ['access' => 'restricted_visible'] + $this->payload());

        self::assertResponseIsSuccessful();
        $offerings = EntrepotMockResponseFactory::stored('offerings');
        self::assertCount(1, $offerings);
        self::assertNotSame(self::OFFERING_ID, $offerings[0]['_id']);
        self::assertSame($offerings[0]['_id'], $this->jsonResponse($client)['_id']);
        self::assertSame(EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID, $offerings[0]['endpoint']['_id']);
        self::assertSame(
            ['community-1', $this->cartesGouvCommunityId()],
            array_map(fn (array $permission) => $permission['beneficiary']['_id'], EntrepotMockResponseFactory::stored('permissions')),
        );
    }

    public function testFailedOfferingCreationLeavesTheFluxWithoutOffering(): void
    {
        $this->seedService('WFS');
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('POST configurations/'.self::CONFIGURATION_ID.'/offerings');

        $this->post($client, ['access' => 'restricted'] + $this->payload());

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('offerings'));
    }

    public function testExpiredPermissionsAreRenewedWhenTheAccessChanges(): void
    {
        $client = $this->client();
        $this->seedService('WFS', open: false);
        $this->seedPermission('expired-own', 'community-1', '2020-01-01T00:00:00+00:00');
        $this->seedPermission('expired-cartes', $this->cartesGouvCommunityId(), '2020-01-01T00:00:00+00:00');

        $this->post($client, ['access' => 'restricted_visible'] + $this->payload());

        self::assertResponseIsSuccessful();
        $permissions = EntrepotMockResponseFactory::stored('permissions');
        self::assertNotContains('expired-own', array_column($permissions, '_id'));
        self::assertNotContains('expired-cartes', array_column($permissions, '_id'));
        self::assertSame(['community-1', $this->cartesGouvCommunityId()], array_map(fn (array $permission) => $permission['beneficiary']['_id'], $permissions));
    }

    public function testExpiredPermissionIsRenewedOnceWhenTheDatastoreCommunityIsTheCartesGouvCommunity(): void
    {
        $client = $this->client();
        EntrepotMockResponseFactory::setDatastoreCommunity($this->cartesGouvCommunityId());
        $this->seedService('WFS', open: false);
        $this->seedPermission('expired-cartes', $this->cartesGouvCommunityId(), '2020-01-01T00:00:00+00:00');

        $this->post($client, ['access' => 'restricted_visible'] + $this->payload());

        self::assertResponseIsSuccessful();
        self::assertSame([$this->cartesGouvCommunityId()], array_map(fn (array $permission) => $permission['beneficiary']['_id'], EntrepotMockResponseFactory::stored('permissions')));
    }

    public function testPermissionsAreLeftIntactWhenTheAccessIsUnchanged(): void
    {
        $this->seedService('WFS', open: false);
        $this->seedPermission('expired-own', 'community-1', '2020-01-01T00:00:00+00:00');
        $client = $this->client();

        $this->post($client, ['access' => 'restricted'] + $this->payload());

        self::assertResponseIsSuccessful();
        self::assertSame(['expired-own'], array_column(EntrepotMockResponseFactory::stored('permissions'), '_id'));
    }

    public function testWmsVectorFluxIsRefused(): void
    {
        $this->seedService('WMS-VECTOR');
        $client = $this->client();

        $this->post($client, $this->payload());

        self::assertResponseStatusCodeSame(400);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testFluxBeingPublishedAnswers409WithoutWriting(): void
    {
        $this->seedService('WFS', offeringStatus: 'PUBLISHING');
        $client = $this->client();

        $this->post($client, $this->payload(), ['thumbnail' => $this->png()]);

        self::assertResponseStatusCodeSame(409);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testInvalidFieldsAnswer422ByType(): void
    {
        $this->seedService('WFS');
        $client = $this->client();

        $this->post($client, ['tables' => []] + $this->payload());

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['tables'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));

        $table = $this->payload()['tables'][0];
        $this->post($client, ['tables' => [['public_name' => 'Nom Invalide'] + $table]] + $this->payload());

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['tables[0].public_name'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());

        // nom déjà enregistré d’un ancien flux, hors de la règle des minuscules
        $this->post($client, ['tables' => [['public_name' => 'Communes_2020'] + $table]] + $this->payload());

        self::assertResponseIsSuccessful();
    }

    public function testEmptyDescriptionAnswers422OutsideWfs(): void
    {
        $this->seedService('WMS-RASTER');
        $client = $this->client();

        $this->post($client, ['description' => ''] + $this->payload());

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['description'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    private function client(): KernelBrowser
    {
        $client = self::createClient();
        $this->logIn($client);

        return $client;
    }

    private function cartesGouvCommunityId(): string
    {
        return self::getContainer()->getParameter('config')['community_id'];
    }

    private function seedService(string $type, bool $open = true, string $offeringStatus = 'PUBLISHED'): void
    {
        EntrepotMockResponseFactory::seed('configurations', $this->seededConfiguration($type));
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'pyramid-1', 'type' => 'ROK4-PYRAMID-RASTER', 'tags' => ['datasheet_name' => 'Fiche']]);
        EntrepotMockResponseFactory::seed('offerings', [
            '_id' => self::OFFERING_ID,
            'type' => $type,
            'layer_name' => 'SANDBOX.mon_flux',
            'open' => $open,
            'status' => $offeringStatus,
            'endpoint' => ['_id' => $open ? EntrepotMockResponseFactory::WFS_PUBLIC_ENDPOINT_ID : EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID],
            'configuration' => ['_id' => self::CONFIGURATION_ID],
            'urls' => [['type' => 'WFS', 'url' => 'https://wfs.test/public']],
        ]);
    }

    /** @return array<string, mixed> */
    private function seededConfiguration(string $type): array
    {
        $typeInfos = 'WFS' === $type
            ? ['used_data' => [[
                'stored_data' => 'vectordb-1',
                'relations' => [['native_name' => 'communes', 'public_name' => 'Communes_2020', 'title' => 'Communes', 'abstract' => 'Les communes']],
            ]], 'expose_primary_key' => true]
            : [
                'used_data' => [['stored_data' => 'pyramid-1', 'bottom_level' => '18', 'top_level' => '5']],
                'styles' => ['static-legend'],
                'title' => 'Ancien titre',
                'abstract' => '"Ancienne description"',
                'keywords' => ['Ancien mot-clé'],
            ];

        return [
            '_id' => self::CONFIGURATION_ID,
            'type' => $type,
            'status' => 'PUBLISHED',
            'name' => 'Ancien titre',
            'layer_name' => 'SANDBOX.mon_flux',
            'tags' => ['datasheet_name' => 'Fiche', 'theme' => 'Hydrographie'],
            'type_infos' => $typeInfos,
            'metadata' => [['format' => 'text/html', 'url' => 'https://catalogue.test/dataset/ign.fiche', 'type' => 'Other']],
            'attribution' => ['title' => 'IGN', 'url' => 'https://www.ign.fr', 'logo' => ['url' => self::ANNEXES_URL.self::OLD_LOGO_PATH, 'width' => 1, 'height' => 1, 'format' => 'image/png']],
            'extra' => ['styles' => [self::STYLE], '_search' => ['url_vignette' => self::ANNEXES_URL.self::OLD_THUMBNAIL_PATH, 'autre' => 'valeur']],
        ];
    }

    private function seedPermission(string $id, string $communityId, string $endDate): void
    {
        EntrepotMockResponseFactory::seed('permissions', [
            '_id' => $id,
            'end_date' => $endDate,
            'offerings' => [['_id' => self::OFFERING_ID]],
            'beneficiary' => ['_id' => $communityId],
        ]);
    }

    /** @return array<mixed> corps du dernier PUT de la configuration */
    private function configurationPut(): array
    {
        $puts = array_values(array_filter(
            EntrepotMockResponseFactory::writeRequests(),
            fn (array $request) => 'PUT' === $request['method'] && str_ends_with($request['path'], '/configurations/'.self::CONFIGURATION_ID),
        ));
        self::assertNotEmpty($puts);

        return json_decode(end($puts)['body'], true, flags: JSON_THROW_ON_ERROR);
    }

    /** @return list<string> annexes semées encore présentes */
    private function remainingSeededAnnexes(): array
    {
        return array_values(array_intersect(array_column(EntrepotMockResponseFactory::stored('annexes'), '_id'), ['annexe-service-thumbnail', 'annexe-attribution-logo']));
    }

    private function png(): UploadedFile
    {
        $path = (string) tempnam(sys_get_temp_dir(), 'image');
        file_put_contents($path, base64_decode(self::PNG_1X1, true));

        return new UploadedFile($path, 'image.png', 'image/png', null, true);
    }

    /**
     * @param array<string, mixed>        $payload
     * @param array<string, UploadedFile> $files
     */
    private function post(KernelBrowser $client, array $payload, array $files = []): void
    {
        $client->xmlHttpRequest('POST', self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/offerings/'.self::OFFERING_ID.'/edit', ['data' => json_encode($payload, JSON_THROW_ON_ERROR)], $files);
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'title' => 'Flux modifié',
            'themes' => ['Hydrographie', 'Transports'],
            'access' => 'public',
            'attribution' => null,
            'description' => '',
            'tables' => [[
                'native_name' => 'communes',
                'title' => 'Communes',
                'public_name' => 'communes',
                'description' => 'Les communes',
                'keywords' => [],
            ]],
            'remove_thumbnail' => false,
            'remove_attribution_logo' => false,
        ];
    }
}
