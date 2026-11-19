<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Liste des flux d’une fiche, lue à partir de ses configurations, et suppression de la fiche par ses configurations.
 */
final class DatasheetServiceListRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const DATASTORE_PATH = '/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID;
    private const LIST_URL = self::BASE.self::DATASTORE_PATH.'/datasheet/Fiche/services';
    private const OFFERING_UUID = '44444444-4444-4444-8444-444444444444';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
    }

    public function testReturnsTheServicesAndTheConfigurationsWithoutOfferingOfTheDatasheet(): void
    {
        $this->seedService('wfs', 'WFS', EntrepotMockResponseFactory::WFS_PUBLIC_ENDPOINT_ID, 'vector-db-1');
        $this->seedConfiguration('orphan', 'WMS-VECTOR', 'vector-db-1');
        // flux d’une autre fiche, et flux dont la configuration n’a pas le tag
        $this->seedService('other', 'WFS', EntrepotMockResponseFactory::WFS_PUBLIC_ENDPOINT_ID, 'vector-db-1', datasheetName: 'Autre');
        $this->seedService('untagged', 'WFS', EntrepotMockResponseFactory::WFS_PUBLIC_ENDPOINT_ID, 'vector-db-1', datasheetName: null);

        $list = $this->getList();

        self::assertSame(['offering-wfs'], array_column($list['services'], '_id'));
        self::assertSame('configuration-wfs', $list['services'][0]['configuration']['_id']);
        self::assertSame(['configuration-orphan'], array_column($list['configurations_without_offering'], '_id'));
        self::assertArrayNotHasKey('styles', $list['services'][0]['configuration']);
        self::assertSame('https://entrepot.test/annexes/entrepot_test/wfs-public/capabilities.xml', $list['services'][0]['share_url']);
    }

    public function testReducesThePyramidToItsTypeAndBuildsTheTmsUrlFromTheOffering(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'pyramid-vector-1', 'type' => 'ROK4-PYRAMID-VECTOR', 'name' => 'Pyramide', 'tags' => ['datasheet_name' => 'Fiche']]);
        // URL TMS en premier : choisie par son type, pas par sa position
        $this->seedService('tms', 'WMTS-TMS', EntrepotMockResponseFactory::WMTS_PUBLIC_ENDPOINT_ID, 'pyramid-vector-1', urls: [
            ['type' => 'TMS', 'url' => 'https://tms.test/tms/1.0.0/couche'],
            ['type' => 'WMTS', 'url' => 'https://wmts.test/public?layer=couche'],
        ]);

        $service = $this->getList()['services'][0];

        self::assertSame(['type' => 'ROK4-PYRAMID-VECTOR'], $service['configuration']['pyramid']);
        self::assertSame('https://tms.test/tms/1.0.0/couche/{z}/{x}/{y}.pbf', $service['share_url']);
        self::assertArrayNotHasKey('tms_metadata', $service);
    }

    public function testATmsWithoutTmsUrlHasNoShareUrl(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'pyramid-vector-1', 'type' => 'ROK4-PYRAMID-VECTOR', 'tags' => ['datasheet_name' => 'Fiche']]);
        $this->seedService('tms', 'WMTS-TMS', EntrepotMockResponseFactory::WMTS_PUBLIC_ENDPOINT_ID, 'pyramid-vector-1', urls: [['type' => 'WMTS', 'url' => 'https://wmts.test/public?layer=couche']]);

        self::assertNull($this->getList()['services'][0]['share_url']);
    }

    public function testAPyramidWithoutTheDatasheetTagLeavesThePyramidTypeUnknown(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'pyramid-vector-1', 'type' => 'ROK4-PYRAMID-VECTOR', 'tags' => []]);
        $this->seedService('tms', 'WMTS-TMS', EntrepotMockResponseFactory::WMTS_PUBLIC_ENDPOINT_ID, 'pyramid-vector-1');

        $service = $this->getList()['services'][0];

        self::assertNull($service['configuration']['pyramid']);
        self::assertNull($service['share_url']);
    }

    public function testAPrivateServiceSharesTheGetCapabilitiesUrlOfItsEndpoint(): void
    {
        $this->seedService('private', 'WFS', EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID, 'vector-db-1', open: false, urls: [
            ['type' => 'WFS', 'url' => 'https://wfs.test/private?service=WFS&version=2.0.0&request=GetCapabilities'],
        ]);

        self::assertSame('https://wfs.test/private?SERVICE=WFS&VERSION=2.0.0&request=GetCapabilities', $this->getList()['services'][0]['share_url']);
    }

    public function testAPrivateWmtsPicksTheWmtsUrlsByType(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'pyramid-raster-1', 'type' => 'ROK4-PYRAMID-RASTER', 'tags' => ['datasheet_name' => 'Fiche']]);
        $this->seedService('wmts', 'WMTS-TMS', EntrepotMockResponseFactory::WMTS_PRIVATE_ENDPOINT_ID, 'pyramid-raster-1', open: false, urls: [
            ['type' => 'TMS', 'url' => 'https://tms.test/private/tms/1.0.0/couche'],
            ['type' => 'WMTS', 'url' => 'https://wmts.test/private?service=WMTS&version=1.0.0&request=GetTile&layer=couche'],
        ]);

        self::assertSame('https://wmts.test/private?SERVICE=WMTS&VERSION=1.0.0&request=GetCapabilities', $this->getList()['services'][0]['share_url']);
    }

    public function testAPrivateTmsSharesItsTilesUrl(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'pyramid-vector-1', 'type' => 'ROK4-PYRAMID-VECTOR', 'tags' => ['datasheet_name' => 'Fiche']]);
        $this->seedService('tms', 'WMTS-TMS', EntrepotMockResponseFactory::WMTS_PUBLIC_ENDPOINT_ID, 'pyramid-vector-1', open: false, urls: [
            ['type' => 'TMS', 'url' => 'https://tms.test/private/tms/1.0.0/couche'],
        ]);

        self::assertSame('https://tms.test/private/tms/1.0.0/couche/{z}/{x}/{y}.pbf', $this->getList()['services'][0]['share_url']);
    }

    public function testGivesTheAccessOfEachService(): void
    {
        $this->seedService('public', 'WFS', EntrepotMockResponseFactory::WFS_PUBLIC_ENDPOINT_ID, 'vector-db-1');
        $this->seedService('visible', 'WFS', EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID, 'vector-db-1', open: false);
        $this->seedService('expired', 'WFS', EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID, 'vector-db-1', open: false);
        $this->seedService('restricted', 'WFS', EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID, 'vector-db-1', open: false);
        $client = $this->client();
        $this->seedPermission('offering-visible', '2099-01-01T00:00:00+00:00');
        $this->seedPermission('offering-expired', '2020-01-01T00:00:00+00:00');

        $services = $this->getList($client)['services'];

        self::assertSame(
            ['offering-public' => 'public', 'offering-visible' => 'restricted_visible', 'offering-expired' => 'restricted', 'offering-restricted' => 'restricted'],
            array_column($services, 'access', '_id'),
        );
    }

    public function testAFailedPermissionsReadLeavesTheAccessOfPrivateServicesUnknown(): void
    {
        $this->seedService('public', 'WFS', EntrepotMockResponseFactory::WFS_PUBLIC_ENDPOINT_ID, 'vector-db-1');
        $this->seedService('private', 'WFS', EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID, 'vector-db-1', open: false);
        // 403 : un 500 serait rejoué par le client HTTP
        EntrepotMockResponseFactory::failNext('GET permissions', status: 403);

        self::assertSame(['offering-public' => 'public', 'offering-private' => null], array_column($this->getList()['services'], 'access', '_id'));
    }

    public function testDoesNotReadThePermissionsWhenEveryServiceIsOpen(): void
    {
        $this->seedService('public', 'WFS', EntrepotMockResponseFactory::WFS_PUBLIC_ENDPOINT_ID, 'vector-db-1');
        // une lecture des permissions échouerait
        EntrepotMockResponseFactory::failNext('GET permissions', status: 403);

        self::assertSame('public', $this->getList()['services'][0]['access']);
    }

    public function testTheServiceRouteGivesTheAccessToo(): void
    {
        $this->seedService('visible', 'WFS', EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID, 'vector-db-1', open: false, offeringId: self::OFFERING_UUID);
        $client = $this->client();
        $this->seedPermission(self::OFFERING_UUID, '2099-01-01T00:00:00+00:00');

        $client->xmlHttpRequest('GET', self::BASE.self::DATASTORE_PATH.'/offerings/'.self::OFFERING_UUID);

        self::assertResponseIsSuccessful();
        self::assertSame('restricted_visible', json_decode((string) $client->getResponse()->getContent(), true)['access']);
    }

    public function testTheServiceRouteNoLongerReadsTheTmsMetadata(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'pyramid-vector-1', 'type' => 'ROK4-PYRAMID-VECTOR', 'tags' => ['datasheet_name' => 'Fiche']]);
        $this->seedService('tms', 'WMTS-TMS', EntrepotMockResponseFactory::WMTS_PUBLIC_ENDPOINT_ID, 'pyramid-vector-1', offeringId: self::OFFERING_UUID);

        $client = $this->client();
        $client->xmlHttpRequest('GET', self::BASE.self::DATASTORE_PATH.'/offerings/'.self::OFFERING_UUID);

        self::assertResponseIsSuccessful();
        $service = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertArrayNotHasKey('tms_metadata', $service);
        self::assertSame('https://tms.test/tms/1.0.0/tms/{z}/{x}/{y}.pbf', $service['share_url']);
    }

    public function testDeletingTheDatasheetRemovesItsConfigurationsWithoutOfferingBeforeTheStoredData(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'vector-db-1', 'type' => 'VECTOR-DB', 'tags' => ['datasheet_name' => 'Fiche']]);
        $this->seedConfiguration('orphan', 'WMS-VECTOR', 'vector-db-1');

        $client = $this->client();
        $client->xmlHttpRequest('DELETE', self::BASE.self::DATASTORE_PATH.'/datasheet/Fiche');

        self::assertResponseStatusCodeSame(204);
        $deletes = array_values(array_filter(
            array_map(fn (array $request) => $request['method'].' '.$request['path'], EntrepotMockResponseFactory::writeRequests()),
            fn (string $request) => str_starts_with($request, 'DELETE '.self::DATASTORE_PATH.'/configurations/') || str_starts_with($request, 'DELETE '.self::DATASTORE_PATH.'/stored_data/'),
        ));
        self::assertSame([
            'DELETE '.self::DATASTORE_PATH.'/configurations/configuration-orphan',
            'DELETE '.self::DATASTORE_PATH.'/stored_data/vector-db-1',
        ], $deletes);
    }

    /**
     * @param list<array{type: string, url: string}>|null $urls
     */
    private function seedService(string $key, string $type, string $endpointId, string $storedDataId, ?string $datasheetName = 'Fiche', bool $open = true, ?array $urls = null, ?string $offeringId = null): void
    {
        $this->seedConfiguration($key, $type, $storedDataId, $datasheetName);
        EntrepotMockResponseFactory::seed('offerings', [
            '_id' => $offeringId ?? "offering-$key",
            'type' => $type,
            'open' => $open,
            'status' => 'PUBLISHED',
            'layer_name' => $key,
            'configuration' => ['_id' => "configuration-$key"],
            'endpoint' => ['_id' => $endpointId],
            'urls' => $urls ?? [['type' => 'TMS', 'url' => "https://tms.test/tms/1.0.0/$key"]],
        ]);
    }

    private function seedPermission(string $offeringId, string $endDate): void
    {
        EntrepotMockResponseFactory::seed('permissions', [
            '_id' => "permission-$offeringId",
            'end_date' => $endDate,
            'offerings' => [['_id' => $offeringId]],
            'beneficiary' => ['_id' => self::getContainer()->getParameter('config')['community_id']],
        ]);
    }

    private function seedConfiguration(string $key, string $type, string $storedDataId, ?string $datasheetName = 'Fiche'): void
    {
        EntrepotMockResponseFactory::seed('configurations', [
            '_id' => "configuration-$key",
            'name' => $key,
            'type' => $type,
            'status' => 'PUBLISHED',
            'tags' => null === $datasheetName ? [] : ['datasheet_name' => $datasheetName],
            'type_infos' => ['used_data' => [['stored_data' => $storedDataId]]],
        ]);
    }

    /**
     * @return array{services: list<array<mixed>>, configurations_without_offering: list<array<mixed>>}
     */
    private function getList(?KernelBrowser $client = null): array
    {
        $client ??= $this->client();
        $client->xmlHttpRequest('GET', self::LIST_URL);

        self::assertResponseIsSuccessful();

        return json_decode((string) $client->getResponse()->getContent(), true);
    }

    private function client(): KernelBrowser
    {
        $client = self::createClient();
        $this->logIn($client);

        return $client;
    }
}
