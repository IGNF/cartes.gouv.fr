<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Permissions des formulaires classiques (`saveService`), mêmes règles que la page du flux.
 */
final class ClassicServicePermissionsTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const OFFERING_ID = '6e4d2c3b-9f8a-4b7c-8d1e-2f3a4b5c6d7e';
    private const CONFIGURATION_ID = 'configuration-classic';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed(
            'metadata',
            ['_id' => 'metadata-1', 'file_identifier' => 'ign.fiche', 'tags' => ['datasheet_name' => 'Fiche'], 'endpoints' => []],
            (string) file_get_contents(__DIR__.'/../Fixture/metadata/expected-minimal.xml'),
        );
    }

    public function testExpiredPermissionsAreRenewedWhenTheAccessChanges(): void
    {
        $client = $this->client();
        $this->seedPrivateWfs();
        $this->seedPermission('expired-own', 'community-1', '2020-01-01T00:00:00+00:00');
        $this->seedPermission('expired-cartes', $this->cartesGouvCommunityId(), '2020-01-01T00:00:00+00:00');

        $this->edit($client, allowViewData: true);

        self::assertResponseIsSuccessful();
        $permissions = EntrepotMockResponseFactory::stored('permissions');
        self::assertSame([], array_intersect(['expired-own', 'expired-cartes'], array_column($permissions, '_id')));
        self::assertSame(['community-1', $this->cartesGouvCommunityId()], array_map(fn (array $permission) => $permission['beneficiary']['_id'], $permissions));
    }

    public function testRestrictedAccessKeepsTheOwnPermissionWhenTheDatastoreCommunityIsTheCartesGouvCommunity(): void
    {
        $client = $this->client();
        EntrepotMockResponseFactory::setDatastoreCommunity($this->cartesGouvCommunityId());
        $this->seedPrivateWfs();
        $this->seedPermission('own', $this->cartesGouvCommunityId(), '2099-01-01T00:00:00+00:00');

        $this->edit($client, allowViewData: false);

        self::assertResponseIsSuccessful();
        self::assertSame(['own'], array_column(EntrepotMockResponseFactory::stored('permissions'), '_id'));
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

    private function seedPrivateWfs(): void
    {
        EntrepotMockResponseFactory::seed('configurations', [
            '_id' => self::CONFIGURATION_ID,
            'type' => 'WFS',
            'status' => 'PUBLISHED',
            'name' => 'Flux',
            'layer_name' => 'SANDBOX.flux',
            'tags' => ['datasheet_name' => 'Fiche', 'theme' => 'Hydrographie'],
            'type_infos' => ['used_data' => [['stored_data' => 'vectordb-1', 'relations' => [['native_name' => 'communes', 'title' => 'Communes', 'abstract' => 'Les communes']]]]],
            'metadata' => [],
        ]);
        EntrepotMockResponseFactory::seed('offerings', [
            '_id' => self::OFFERING_ID,
            'type' => 'WFS',
            'layer_name' => 'SANDBOX.flux',
            'open' => false,
            'status' => 'PUBLISHED',
            'endpoint' => ['_id' => EntrepotMockResponseFactory::WFS_PRIVATE_ENDPOINT_ID],
            'configuration' => ['_id' => self::CONFIGURATION_ID],
            'urls' => [['type' => 'WFS', 'url' => 'https://wfs.test/private']],
        ]);
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

    private function edit(KernelBrowser $client, bool $allowViewData): void
    {
        $client->jsonRequest(
            'POST',
            self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/stored_data/vectordb-1/wfs/'.self::OFFERING_ID.'/edit',
            [
                'technical_name' => 'flux',
                'public_name' => 'Flux',
                'service_name' => 'Flux',
                'description' => 'Description',
                'identifier' => 'ign.fiche',
                'category' => ['Hydrographie'],
                'keywords' => [],
                'free_keywords' => [],
                'email_contact' => 'contact@example.test',
                'creation_date' => '2024-01-15',
                'organization' => 'Organisation',
                'organization_email' => 'orga@example.test',
                'projection' => 'EPSG:2154',
                'attribution_text' => '',
                'attribution_url' => '',
                'language' => ['code' => 'fre', 'language' => 'français'],
                'charset' => 'utf8',
                'resolution' => null,
                'hierarchy_level' => 'dataset',
                'resource_genealogy' => '',
                'frequency_code' => 'monthly',
                'share_with' => 'your_community',
                'allow_view_data' => $allowViewData,
                'table_infos' => [['native_name' => 'communes', 'title' => 'Communes', 'description' => 'Les communes', 'public_name' => 'communes', 'keywords' => []]],
            ],
            ['HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'],
        );
    }
}
