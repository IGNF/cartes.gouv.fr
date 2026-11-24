<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Dépublication d’un flux : offre et configuration supprimées, capabilities filtrées de l’endpoint public, ressources en ligne de la fiche.
 */
final class ServiceUnpublishRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const DATASTORE_PATH = '/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID;
    private const UNPUBLISH_URL = self::BASE.self::DATASTORE_PATH.'/services/offering-1';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::answerGetCapabilities();
        EntrepotMockResponseFactory::seed('configurations', [
            '_id' => 'config-1',
            'type' => 'WFS',
            'status' => 'UNPUBLISHED',
            'tags' => ['datasheet_name' => 'Fiche'],
            'type_infos' => ['used_data' => [['stored_data' => 'vectordb-1', 'relations' => []]]],
        ]);
        // flux voisin sur le même endpoint : il reste dans les capabilities
        EntrepotMockResponseFactory::seed('offerings', $this->offering('offering-2', 'voisin', true, 'config-2'));
    }

    public function testPublicServiceIsRemovedFromTheFilteredCapabilities(): void
    {
        EntrepotMockResponseFactory::seed('offerings', $this->offering('offering-1', 'retire', true));
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::UNPUBLISH_URL);

        self::assertResponseStatusCodeSame(204);
        self::assertSame(['offering-2'], array_column(EntrepotMockResponseFactory::stored('offerings'), '_id'));
        self::assertSame([], EntrepotMockResponseFactory::stored('configurations'));
        $capabilities = EntrepotMockResponseFactory::stored('annexes');
        self::assertSame([['wfs-public/capabilities.xml']], array_column($capabilities, 'paths'));
        $xml = (string) EntrepotMockResponseFactory::annexeFile($capabilities[0]['_id']);
        self::assertStringContainsString('voisin:table', $xml);
        self::assertStringNotContainsString('retire:table', $xml);
        // endpoint lu dans la liste des endpoints, sans le datastore complet
        self::assertSame(0, EntrepotMockResponseFactory::datastoreCalls());
    }

    public function testPrivateServiceLeavesTheCapabilitiesAlone(): void
    {
        EntrepotMockResponseFactory::seed('offerings', $this->offering('offering-1', 'retire', false));
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::UNPUBLISH_URL);

        self::assertResponseStatusCodeSame(204);
        self::assertSame([], EntrepotMockResponseFactory::stored('annexes'));
        self::assertSame(0, EntrepotMockResponseFactory::endpointsCalls());
    }

    public function testUnpublicationSucceedsWhenTheOnlineResourcesRefreshFails(): void
    {
        EntrepotMockResponseFactory::seed('offerings', $this->offering('offering-1', 'retire', false));
        EntrepotMockResponseFactory::failNext('GET metadata', status: 403);
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::UNPUBLISH_URL);

        self::assertResponseStatusCodeSame(204);
        self::assertSame(['offering-2'], array_column(EntrepotMockResponseFactory::stored('offerings'), '_id'));
    }

    public function testUnpublicationSucceedsWhenTheSandboxCommunityCannotBeRead(): void
    {
        EntrepotMockResponseFactory::seed('offerings', $this->offering('offering-1', 'retire', true));
        EntrepotMockResponseFactory::takeSandboxCommunityDown();
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::UNPUBLISH_URL);

        self::assertResponseStatusCodeSame(204);
        self::assertSame(['offering-2'], array_column(EntrepotMockResponseFactory::stored('offerings'), '_id'));
    }

    public function testWmsVectorStyleAndFeatureInfoFilesAreRemoved(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed('configurations', [
            '_id' => 'config-1',
            'type' => 'WMS-VECTOR',
            'status' => 'UNPUBLISHED',
            'tags' => ['datasheet_name' => 'Fiche'],
            'type_infos' => ['used_data' => [['stored_data' => 'vectordb-1', 'relations' => [['name' => 'communes', 'style' => 'static-style', 'ftl' => 'static-ftl']]]]],
        ]);
        EntrepotMockResponseFactory::seed('statics', ['_id' => 'static-style']);
        EntrepotMockResponseFactory::seed('statics', ['_id' => 'static-ftl']);
        EntrepotMockResponseFactory::seed('offerings', $this->offering('offering-1', 'retire', false));
        $client = $this->client();

        $client->xmlHttpRequest('DELETE', self::UNPUBLISH_URL);

        self::assertResponseStatusCodeSame(204);
        self::assertSame([], EntrepotMockResponseFactory::stored('statics'));
    }

    /**
     * @return array<string, mixed>
     */
    private function offering(string $id, string $layerName, bool $open, string $configurationId = 'config-1'): array
    {
        return [
            '_id' => $id,
            'type' => 'WFS',
            'layer_name' => $layerName,
            'open' => $open,
            'status' => 'PUBLISHED',
            'endpoint' => ['_id' => $open ? EntrepotMockResponseFactory::WFS_PUBLIC_ENDPOINT_ID : EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID],
            'configuration' => ['_id' => $configurationId],
            'urls' => [['type' => 'WFS', 'url' => 'https://wfs.test/'.($open ? 'public' : 'private').'?service=WFS&version=2.0.0']],
        ];
    }

    private function client(): KernelBrowser
    {
        $client = self::createClient();
        $this->logIn($client);

        return $client;
    }
}
