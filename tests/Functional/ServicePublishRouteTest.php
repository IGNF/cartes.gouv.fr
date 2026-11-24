<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\WmsVectorFeatureInfoService;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Publication d’un flux par `POST /services` : multipart avec le champ `data`, les images et, en WMS vecteur, un fichier SLD par table.
 */
final class ServicePublishRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const PUBLISH_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/services';
    private const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    private const SLD = '<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld"><NamedLayer><Name>communes</Name></NamedLayer></StyledLayerDescriptor>';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed('stored_data', [
            '_id' => 'vectordb-1',
            'type' => 'VECTOR-DB',
            'tags' => ['datasheet_name' => 'Fiche'],
            'type_infos' => ['relations' => [
                ['name' => 'communes', 'attributes' => ['geom' => 'geometry(MultiPolygon,2154)', 'nom' => 'character varying', 'population' => 'integer']],
                ['name' => 'routes nationales', 'attributes' => ['geom' => 'geometry(LineString,2154)', 'numero' => 'character varying']],
            ]],
        ]);
        EntrepotMockResponseFactory::seed('stored_data', [
            '_id' => 'pyramid-raster',
            'name' => 'pyramide',
            'type' => 'ROK4-PYRAMID-RASTER',
            'tags' => ['datasheet_name' => 'Fiche'],
            'type_infos' => ['levels' => ['12', '5', '9']],
        ]);
        EntrepotMockResponseFactory::seed('stored_data', [
            '_id' => 'pyramid-vector',
            'name' => 'pyramide',
            'type' => 'ROK4-PYRAMID-VECTOR',
            'tags' => ['datasheet_name' => 'Fiche'],
            'type_infos' => ['levels' => ['14', '4', '9']],
        ]);
    }

    /**
     * Type de configuration, donnée stockée, endpoint public, identifiant de la configuration créée (les fichiers de style déposés avant prennent les premiers identifiants).
     *
     * @return iterable<string, array{string, string, string, string}>
     */
    public static function publishedTypes(): iterable
    {
        yield 'WFS' => ['WFS', 'vectordb-1', EntrepotMockResponseFactory::WFS_PUBLIC_ENDPOINT_ID, 'configuration-1'];
        yield 'WMS vecteur' => ['WMS-VECTOR', 'vectordb-1', EntrepotMockResponseFactory::WMSV_PUBLIC_ENDPOINT_ID, 'configuration-2'];
        yield 'WMS raster' => ['WMS-RASTER', 'pyramid-raster', EntrepotMockResponseFactory::WMSR_PUBLIC_ENDPOINT_ID, 'configuration-2'];
        yield 'WMTS' => ['WMTS-TMS', 'pyramid-raster', EntrepotMockResponseFactory::WMTS_PUBLIC_ENDPOINT_ID, 'configuration-2'];
        yield 'TMS' => ['WMTS-TMS', 'pyramid-vector', EntrepotMockResponseFactory::WMTS_PUBLIC_ENDPOINT_ID, 'configuration-1'];
    }

    #[DataProvider('publishedTypes')]
    public function testServiceIsCreatedWithItsTagsMetadataLinksOnThePublicEndpoint(string $type, string $storedDataId, string $endpointId): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->publish($client, $type, $storedDataId);

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        self::assertSame($type, $configuration['type']);
        self::assertSame('SANDBOX.mon_flux', $configuration['layer_name']);
        self::assertSame('Mon flux', $configuration['name']);
        self::assertSame(['datasheet_name' => 'Fiche', 'theme' => 'Hydrographie, Transports'], $configuration['tags']);
        self::assertSame($storedDataId, $configuration['type_infos']['used_data'][0]['stored_data']);
        self::assertSame('https://catalogue.test/dataset/ign.fiche', $configuration['metadata'][1]['url']);
        self::assertArrayNotHasKey('attribution', $configuration);
        self::assertSame($endpointId, EntrepotMockResponseFactory::stored('offerings')[0]['endpoint']['_id']);
        self::assertSame([], EntrepotMockResponseFactory::stored('permissions'));
    }

    #[DataProvider('publishedTypes')]
    public function testDatasheetWithoutMetadataAnswers400AndLeavesNoFile(string $type, string $storedDataId): void
    {
        $client = $this->client();

        $this->publish($client, $type, $storedDataId);

        self::assertResponseStatusCodeSame(400);
        self::assertSame('Renseignez d’abord la description de la fiche de données', $this->jsonResponse($client)['detail']);
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
    }

    #[DataProvider('publishedTypes')]
    public function testConfigurationAndStyleFilesAreRemovedWhenTheOfferingCannotBeCreated(string $type, string $storedDataId, string $_endpointId, string $configurationId): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext("POST configurations/$configurationId/offerings");

        $this->publish($client, $type, $storedDataId);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    #[DataProvider('publishedTypes')]
    public function testServiceAndStyleFilesAreKeptWhenTheOnlineResourcesRefreshFails(string $type, string $storedDataId): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('PUT metadata/metadata-1');

        $this->publish($client, $type, $storedDataId);

        self::assertResponseStatusCodeSame(201);
        self::assertCount(1, EntrepotMockResponseFactory::stored('offerings'));
        $configurationId = EntrepotMockResponseFactory::stored('configurations')[0]['_id'];
        $styleSuffix = match (true) {
            'WMS-VECTOR' === $type => 'wmsv_communes',
            'WMS-RASTER' === $type => 'wmsr',
            'pyramid-raster' === $storedDataId => 'wmts',
            default => null,
        };
        self::assertSame(null === $styleSuffix ? [] : ["config_{$configurationId}_style_$styleSuffix"], array_column(EntrepotMockResponseFactory::stored('statics'), 'name'));
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public static function mismatchedStoredData(): iterable
    {
        yield 'WFS sur une pyramide' => ['WFS', 'pyramid-vector'];
        yield 'WMS vecteur sur une pyramide' => ['WMS-VECTOR', 'pyramid-raster'];
        yield 'WMS raster sur une base vecteur' => ['WMS-RASTER', 'vectordb-1'];
        yield 'WMS raster sur une pyramide vecteur' => ['WMS-RASTER', 'pyramid-vector'];
        yield 'WMTS-TMS sur une base vecteur' => ['WMTS-TMS', 'vectordb-1'];
    }

    #[DataProvider('mismatchedStoredData')]
    public function testStoredDataOfAnotherKindAnswers400WithoutWriting(string $type, string $storedDataId): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->publish($client, $type, $storedDataId);

        self::assertResponseStatusCodeSame(400);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testUnknownOrMissingTypeAndInvalidStoredDataIdAnswer422WithoutWriting(): void
    {
        $client = $this->client();

        $this->post($client, ['type' => 'WMS'] + $this->payload('WFS', 'vectordb-1'));
        self::assertResponseStatusCodeSame(422);
        self::assertSame(['type'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));

        $payload = $this->payload('WFS', 'vectordb-1');
        unset($payload['type']);
        $this->post($client, $payload);
        self::assertResponseStatusCodeSame(422);
        self::assertSame(['type'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));

        // inséré dans le chemin des requêtes Entrepôt
        foreach (['../uploads/upload-1', "vectordb-1\n"] as $storedDataId) {
            $this->post($client, $this->payload('WFS', $storedDataId));
            self::assertResponseStatusCodeSame(422);
            self::assertSame(['stored_data_id'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        }
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testEmptyDescriptionAnswers422OutsideWfs(): void
    {
        $client = $this->client();

        foreach (['WMS-VECTOR' => 'vectordb-1', 'WMS-RASTER' => 'pyramid-raster', 'WMTS-TMS' => 'pyramid-vector'] as $type => $storedDataId) {
            $this->post($client, ['description' => ''] + $this->payload($type, $storedDataId));

            self::assertResponseStatusCodeSame(422);
            self::assertSame(['description'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'), $type);
        }
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testWfsRelationsAreBuiltFromTheTables(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->publish($client, 'WFS', 'vectordb-1');

        self::assertResponseStatusCodeSame(201);
        self::assertSame([[
            'stored_data' => 'vectordb-1',
            'relations' => [['native_name' => 'communes', 'public_name' => 'communes', 'title' => 'Communes', 'abstract' => 'Les communes', 'keywords' => ['Unités administratives']]],
        ]], EntrepotMockResponseFactory::stored('configurations')[0]['type_infos']['used_data']);
    }

    public function testThumbnailAndLogoAreStoredAsAnnexesAndReferencedByTheConfiguration(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->post($client, ['attribution' => ['title' => 'IGN', 'url' => 'https://www.ign.fr']] + $this->payload('WFS', 'vectordb-1'), [
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

    public function testRestrictedVisibleServiceGivesPermissionsToTheDatastoreAndCartesGouvCommunities(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->post($client, ['access' => 'restricted_visible'] + $this->payload('WFS', 'vectordb-1'));

        self::assertResponseStatusCodeSame(201);
        self::assertSame(EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID, EntrepotMockResponseFactory::stored('offerings')[0]['endpoint']['_id']);
        self::assertSame(
            ['community-1', self::getContainer()->getParameter('config')['community_id']],
            array_map(fn (array $permission) => $permission['beneficiary']['_id'], EntrepotMockResponseFactory::stored('permissions')),
        );
        self::assertCount(1, $this->permissionPosts());
    }

    // garde contre le doublon : les deux communautés sont la même
    public function testRestrictedVisibleServiceOfTheCartesGouvDatastoreGivesASinglePermission(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        $cartesGouvCommunityId = self::getContainer()->getParameter('config')['community_id'];
        EntrepotMockResponseFactory::setDatastoreCommunity($cartesGouvCommunityId);

        $this->post($client, ['access' => 'restricted_visible'] + $this->payload('WFS', 'vectordb-1'));

        self::assertResponseStatusCodeSame(201);
        self::assertSame([$cartesGouvCommunityId], array_map(fn (array $permission) => $permission['beneficiary']['_id'], EntrepotMockResponseFactory::stored('permissions')));
        self::assertCount(1, $this->permissionPosts());
    }

    public function testRestrictedServiceGivesAPermissionToTheDatastoreCommunityOnly(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->post($client, ['access' => 'restricted'] + $this->payload('WFS', 'vectordb-1'));

        self::assertResponseStatusCodeSame(201);
        self::assertSame(['community-1'], array_map(fn (array $permission) => $permission['beneficiary']['_id'], EntrepotMockResponseFactory::stored('permissions')));
    }

    public function testInvalidWfsFieldsAnswer422WithTheirPaths(): void
    {
        $client = $this->client();
        $payload = $this->payload('WFS', 'vectordb-1');

        $this->post($client, ['technical_name' => 'nom invalide', 'tables' => [], 'access' => 'partout', 'attribution' => ['title' => '', 'url' => 'pas une url']] + $payload);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['access'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'), 'une valeur hors énumération est refusée avant toute autre validation');

        $this->post($client, ['technical_name' => 'nom invalide', 'tables' => [], 'attribution' => ['title' => '', 'url' => 'pas une url']] + $payload);

        self::assertResponseStatusCodeSame(422);
        $paths = array_column($this->jsonResponse($client)['violations'], 'propertyPath');
        sort($paths);
        self::assertSame(['attribution.title', 'attribution.url', 'tables', 'technical_name'], $paths);

        $this->post($client, ['tables' => array_fill(0, 11, $payload['tables'][0])] + $payload);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['tables'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testImageOfAnotherTypeAnswers422OnItsField(): void
    {
        $client = $this->client();
        $path = (string) tempnam(sys_get_temp_dir(), 'logo');
        file_put_contents($path, 'pas une image');

        $this->post($client, $this->payload('WFS', 'vectordb-1'), ['attribution_logo' => new UploadedFile($path, 'logo.png', 'image/png', null, true)]);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['attribution_logo'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
    }

    public function testUnreadableImageWithAPngSignatureAnswers422(): void
    {
        $client = $this->client();
        $path = (string) tempnam(sys_get_temp_dir(), 'vignette');
        // signature PNG suivie de contenu illisible : le type détecté est bon, les dimensions non
        file_put_contents($path, "\x89PNG\r\n\x1a\n".str_repeat('x', 64));

        $this->post($client, $this->payload('WFS', 'vectordb-1'), ['thumbnail' => new UploadedFile($path, 'vignette.png', 'image/png', null, true)]);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['thumbnail'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
    }

    public function testAnnexesAreRemovedWhenTheConfigurationCannotBeCreated(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('POST configurations');

        $this->post($client, $this->payload('WFS', 'vectordb-1'), ['thumbnail' => $this->png('vignette.png')]);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
    }

    public function testOriginalErrorIsReturnedWhenTheRollbackFails(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('POST configurations/configuration-1/offerings');
        EntrepotMockResponseFactory::failNext('DELETE configurations/configuration-1');

        $this->post($client, $this->payload('WFS', 'vectordb-1'));

        self::assertResponseStatusCodeSame(500);
        self::assertStringContainsString('POST configurations/configuration-1/offerings', $this->jsonResponse($client)['detail']);
    }

    public function testWmsVectorStyleFilesAreRenamedAfterTheConfigurationAndReferencedByItsTables(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        $tmpEntries = $this->styleFilesDirEntries();

        $this->post($client, ['selected_tables' => ['communes', 'routes nationales']] + $this->payload('WMS-VECTOR', 'vectordb-1'), styleFiles: ['communes' => $this->sld('communes.sld'), 'routes nationales' => $this->sld('routes.sld')]);

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        $statics = EntrepotMockResponseFactory::stored('statics');
        self::assertSame([
            sprintf('config_%s_style_wmsv_communes', $configuration['_id']),
            sprintf('config_%s_style_wmsv_routes nationales', $configuration['_id']),
        ], array_column($statics, 'name'));
        self::assertSame('Mon flux', $configuration['type_infos']['title']);
        self::assertSame('Description du flux', $configuration['type_infos']['abstract']);
        self::assertSame(['Hydrographie', 'Transports'], $configuration['type_infos']['keywords']);
        self::assertSame([[
            'stored_data' => 'vectordb-1',
            'relations' => [['name' => 'communes', 'style' => $statics[0]['_id']], ['name' => 'routes nationales', 'style' => $statics[1]['_id']]],
        ]], $configuration['type_infos']['used_data']);
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    public function testWmsVectorTableNamedWithDigitsOnlyIsPublished(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        // PHP range une clé « 2024 » en entier
        $this->post($client, ['selected_tables' => ['2024']] + $this->payload('WMS-VECTOR', 'vectordb-1'), styleFiles: ['2024' => $this->sld('2024.sld')]);

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        self::assertSame([sprintf('config_%s_style_wmsv_2024', $configuration['_id'])], array_column(EntrepotMockResponseFactory::stored('statics'), 'name'));
        self::assertSame('2024', $configuration['type_infos']['used_data'][0]['relations'][0]['name']);
    }

    public function testWmsVectorUploadedStyleFilesAreRemovedWhenALaterOneIsRefused(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        $tmpEntries = $this->styleFilesDirEntries();
        EntrepotMockResponseFactory::failNext('POST statics', passes: 1);

        $this->post($client, ['selected_tables' => ['communes', 'routes nationales']] + $this->payload('WMS-VECTOR', 'vectordb-1'), styleFiles: ['communes' => $this->sld('communes.sld'), 'routes nationales' => $this->sld('routes.sld')]);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    public function testWmsVectorConfigurationAndStyleFilesAreRemovedWhenTheRenamingFails(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('PATCH statics/static-1');

        $this->publish($client, 'WMS-VECTOR', 'vectordb-1');

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    public function testWmsVectorFeatureInfoTemplatesAreRenamedAfterTheConfigurationAndReferencedByTheirTables(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        $tmpEntries = $this->styleFilesDirEntries();

        $this->post(
            $client,
            ['selected_tables' => ['communes', 'routes nationales'], 'featureinfo' => ['format' => 'table', 'attributes' => ['communes' => ['nom', 'population'], 'routes nationales' => ['numero']]]] + $this->payload('WMS-VECTOR', 'vectordb-1'),
            styleFiles: ['communes' => $this->sld('communes.sld'), 'routes nationales' => $this->sld('routes.sld')],
        );

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        $statics = EntrepotMockResponseFactory::stored('statics');
        self::assertSame([
            sprintf('config_%s_style_wmsv_communes', $configuration['_id']),
            sprintf('config_%s_style_wmsv_routes nationales', $configuration['_id']),
            sprintf('config_%s_featureinfo_wmsv_communes', $configuration['_id']),
            sprintf('config_%s_featureinfo_wmsv_routes nationales', $configuration['_id']),
        ], array_column($statics, 'name'));
        self::assertSame([
            ['name' => 'communes', 'style' => $statics[0]['_id'], 'ftl' => $statics[2]['_id']],
            ['name' => 'routes nationales', 'style' => $statics[1]['_id'], 'ftl' => $statics[3]['_id']],
        ], $configuration['type_infos']['used_data'][0]['relations']);
        self::assertSame(WmsVectorFeatureInfoService::build('communes', 'table', ['nom', 'population']), EntrepotMockResponseFactory::staticFile($statics[2]['_id']));
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    /**
     * @param array<string, mixed> $featureInfo
     */
    #[DataProvider('invalidFeatureInfos')]
    public function testInvalidFeatureInfoAnswers422OnItsTableWithoutWriting(array $featureInfo, string $path): void
    {
        $client = $this->client();

        $this->post($client, ['featureinfo' => $featureInfo] + $this->payload('WMS-VECTOR', 'vectordb-1'), styleFiles: ['communes' => $this->sld('communes.sld')]);

        self::assertResponseStatusCodeSame(422);
        self::assertSame([$path], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    /**
     * @return iterable<string, array{array<string, mixed>, string}>
     */
    public static function invalidFeatureInfos(): iterable
    {
        yield 'attribut absent de la table' => [['format' => 'list', 'attributes' => ['communes' => ['absent']]], 'featureinfo.attributes[communes]'];
        yield 'colonne géométrique' => [['format' => 'list', 'attributes' => ['communes' => ['geom']]], 'featureinfo.attributes[communes]'];
        yield 'attribut en double' => [['format' => 'list', 'attributes' => ['communes' => ['nom', 'nom']]], 'featureinfo.attributes[communes]'];
        yield 'table non cochée' => [['format' => 'list', 'attributes' => ['communes' => ['nom'], 'routes nationales' => ['numero']]], 'featureinfo.attributes[routes nationales]'];
        yield 'liste vide' => [['format' => 'list', 'attributes' => ['communes' => []]], 'featureinfo.attributes[communes]'];
        yield 'nom avec guillemet' => [['format' => 'list', 'attributes' => ['communes' => ['a"b']]], 'featureinfo.attributes[communes][0]'];
        yield 'format inconnu' => [['format' => 'json', 'attributes' => ['communes' => ['nom']]], 'featureinfo.format'];
    }

    public function testCheckedTableWithoutFeatureInfoAttributesGetsNoTemplate(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->post(
            $client,
            ['selected_tables' => ['communes', 'routes nationales'], 'featureinfo' => ['format' => 'list', 'attributes' => ['communes' => ['nom']]]] + $this->payload('WMS-VECTOR', 'vectordb-1'),
            styleFiles: ['communes' => $this->sld('communes.sld'), 'routes nationales' => $this->sld('routes.sld')],
        );

        self::assertResponseStatusCodeSame(201);
        $relations = EntrepotMockResponseFactory::stored('configurations')[0]['type_infos']['used_data'][0]['relations'];
        self::assertArrayHasKey('ftl', $relations[0]);
        self::assertArrayNotHasKey('ftl', $relations[1]);
    }

    public function testStyleFilesAreRemovedWhenAFeatureInfoTemplateIsRefused(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('POST statics', passes: 1);

        $this->post($client, ['featureinfo' => ['format' => 'list', 'attributes' => ['communes' => ['nom']]]] + $this->payload('WMS-VECTOR', 'vectordb-1'), styleFiles: ['communes' => $this->sld('communes.sld')]);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
    }

    public function testConfigurationStyleAndFeatureInfoFilesAreRemovedWhenTheFeatureInfoRenamingFails(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('PATCH statics/static-2');

        $this->post($client, ['featureinfo' => ['format' => 'list', 'attributes' => ['communes' => ['nom']]]] + $this->payload('WMS-VECTOR', 'vectordb-1'), styleFiles: ['communes' => $this->sld('communes.sld')]);

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    public function testTechnicalNameWithoutTheDatastorePrefixAnswers422BeforeAnyUpload(): void
    {
        $this->seedMetadata();
        EntrepotMockResponseFactory::setDatastorePrefixes(['configuration_layer_name_prefix' => 'SANDBOX']);
        $client = $this->client();
        // la réponse du datastore est mise en cache entre les tests
        $datastoreApiService = self::getContainer()->get(DatastoreApiService::class);
        $datastoreApiService->invalidate(EntrepotMockResponseFactory::DATASTORE_ID);

        try {
            $this->publish($client, 'WMS-VECTOR', 'vectordb-1');

            self::assertResponseStatusCodeSame(422);
            self::assertSame([['propertyPath' => 'technical_name', 'title' => 'Le nom technique doit commencer par « SANDBOX_ »']], array_map(
                fn (array $violation) => ['propertyPath' => $violation['propertyPath'], 'title' => $violation['title']],
                $this->jsonResponse($client)['violations'],
            ));
            self::assertSame([], EntrepotMockResponseFactory::writeRequests(), 'refus avant tout dépôt de fichier');
        } finally {
            $datastoreApiService->invalidate(EntrepotMockResponseFactory::DATASTORE_ID);
        }
    }

    public function testWmsVectorMissingOrInvalidStyleFilesAnswer422OnTheirTablePathWithoutWriting(): void
    {
        $client = $this->client();
        $path = (string) tempnam(sys_get_temp_dir(), 'style');
        file_put_contents($path, '{}');

        $this->post($client, ['selected_tables' => ['communes', 'routes nationales']] + $this->payload('WMS-VECTOR', 'vectordb-1'), styleFiles: ['communes' => new UploadedFile($path, 'communes.json', 'application/json', null, true)]);

        self::assertResponseStatusCodeSame(422);
        $paths = array_column($this->jsonResponse($client)['violations'], 'propertyPath');
        sort($paths);
        self::assertSame(['style_files[communes]', 'style_files[routes nationales]'], $paths);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testInvalidWmsVectorTablesAnswer422(): void
    {
        $client = $this->client();
        $payload = $this->payload('WMS-VECTOR', 'vectordb-1');

        $this->post($client, ['selected_tables' => []] + $payload);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['selected_tables'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));

        $this->post($client, ['selected_tables' => array_map(fn (int $i) => "table_$i", range(1, 11))] + $payload);

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['selected_tables'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public static function rasterTypes(): iterable
    {
        yield 'WMS raster' => ['WMS-RASTER', 'wmsr'];
        yield 'WMTS' => ['WMTS-TMS', 'wmts'];
    }

    #[DataProvider('rasterTypes')]
    public function testRasterLegendStyleIsRenamedAfterTheConfigurationAndReferencedByIt(string $type, string $styleSuffix): void
    {
        $this->seedMetadata();
        $client = $this->client();
        $tmpEntries = $this->styleFilesDirEntries();

        $this->publish($client, $type, 'pyramid-raster');

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        $statics = EntrepotMockResponseFactory::stored('statics');
        self::assertSame([sprintf('config_%s_style_%s', $configuration['_id'], $styleSuffix)], array_column($statics, 'name'));
        self::assertSame('Description du flux', $configuration['type_infos']['abstract']);
        self::assertSame([['bottom_level' => '12', 'top_level' => '5', 'stored_data' => 'pyramid-raster']], $configuration['type_infos']['used_data']);
        self::assertSame([$statics[0]['_id']], $configuration['type_infos']['styles']);
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    public function testRasterConfigurationAndLegendStyleAreRemovedWhenTheRenamingFails(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        EntrepotMockResponseFactory::failNext('PATCH statics/static-1');

        $this->publish($client, 'WMS-RASTER', 'pyramid-raster');

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    public function testNoTemporaryFileRemainsWhenTheLegendStyleUploadFails(): void
    {
        $this->seedMetadata();
        $client = $this->client();
        $tmpEntries = $this->styleFilesDirEntries();
        EntrepotMockResponseFactory::failNext('POST statics');

        $this->publish($client, 'WMS-RASTER', 'pyramid-raster');

        self::assertResponseStatusCodeSame(500);
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        self::assertSame($tmpEntries, $this->styleFilesDirEntries(), 'aucun dossier temporaire ne reste sur le disque');
    }

    public function testTmsHasTheVectorPyramidLevelsAndNoStyle(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->publish($client, 'WMTS-TMS', 'pyramid-vector');

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        self::assertSame([['bottom_level' => '14', 'top_level' => '4', 'stored_data' => 'pyramid-vector']], $configuration['type_infos']['used_data']);
        self::assertArrayNotHasKey('styles', $configuration['type_infos']);
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
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

    private function sld(string $name): UploadedFile
    {
        $path = (string) tempnam(sys_get_temp_dir(), 'style');
        file_put_contents($path, self::SLD);

        return new UploadedFile($path, $name, 'application/octet-stream', null, true);
    }

    /** @return list<string> */
    private function styleFilesDirEntries(): array
    {
        $dir = (string) self::getContainer()->getParameter('style_files_path');

        return is_dir($dir) ? array_values(array_diff(scandir($dir) ?: [], ['.', '..'])) : [];
    }

    /** Publication avec le formulaire par défaut du type, et le fichier de style de « communes » en WMS vecteur. */
    private function publish(KernelBrowser $client, string $type, string $storedDataId): void
    {
        $this->post($client, $this->payload($type, $storedDataId), styleFiles: 'WMS-VECTOR' === $type ? ['communes' => $this->sld('communes.sld')] : []);
    }

    /**
     * @param array<string, mixed>           $payload
     * @param array<string, UploadedFile>    $files
     * @param array<array-key, UploadedFile> $styleFiles par nom de table
     */
    private function post(KernelBrowser $client, array $payload, array $files = [], array $styleFiles = []): void
    {
        $client->xmlHttpRequest('POST', self::PUBLISH_URL, ['data' => json_encode($payload, JSON_THROW_ON_ERROR)], [...$files, 'style_files' => $styleFiles]);
    }

    /** @return array<string, mixed> */
    private function payload(string $type, string $storedDataId): array
    {
        return [
            'type' => $type,
            'stored_data_id' => $storedDataId,
            'title' => 'Mon flux',
            'technical_name' => 'SANDBOX.mon_flux',
            'description' => 'Description du flux',
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
            'selected_tables' => ['communes'],
        ];
    }

    /** @return list<array{method: string, path: string, body: string}> */
    private function permissionPosts(): array
    {
        return array_values(array_filter(
            EntrepotMockResponseFactory::writeRequests(),
            fn (array $request) => 'POST' === $request['method'] && str_ends_with($request['path'], '/permissions'),
        ));
    }
}
