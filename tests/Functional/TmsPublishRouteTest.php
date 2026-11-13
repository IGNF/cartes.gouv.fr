<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Publication d’un flux TMS depuis le nouveau formulaire : champ `data`, configuration WMTS-TMS sur la pyramide vecteur.
 */
final class TmsPublishRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const PUBLISH_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/pyramid-vector/pyramid-1/tms/publish';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
        EntrepotMockResponseFactory::seed('stored_data', [
            '_id' => 'pyramid-1',
            'name' => 'pyramide',
            'type' => 'ROK4-PYRAMID-VECTOR',
            'tags' => ['datasheet_name' => 'Fiche'],
            'type_infos' => ['levels' => ['14', '4', '9']],
        ]);
    }

    public function testConfigurationIsPublishedOnTheTmsEndpoint(): void
    {
        $this->seedMetadata();
        $client = $this->client();

        $this->post($client, $this->payload());

        self::assertResponseStatusCodeSame(201);
        $configuration = EntrepotMockResponseFactory::stored('configurations')[0];
        self::assertSame('WMTS-TMS', $configuration['type']);
        self::assertSame('Mon flux', $configuration['type_infos']['title']);
        self::assertSame('Hydrographie des Ardennes', $configuration['type_infos']['abstract']);
        self::assertSame(['Hydrographie'], $configuration['type_infos']['keywords']);
        self::assertSame([['bottom_level' => '14', 'top_level' => '4', 'stored_data' => 'pyramid-1']], $configuration['type_infos']['used_data']);
        self::assertArrayNotHasKey('styles', $configuration['type_infos']);
        self::assertSame(EntrepotMockResponseFactory::WMTS_PUBLIC_ENDPOINT_ID, EntrepotMockResponseFactory::stored('offerings')[0]['endpoint']['_id']);
    }

    public function testStoredDataOtherThanAVectorPyramidAnswers400WithoutWriting(): void
    {
        EntrepotMockResponseFactory::seed('stored_data', ['_id' => 'raster-1', 'type' => 'ROK4-PYRAMID-RASTER', 'tags' => ['datasheet_name' => 'Fiche']]);
        $this->seedMetadata();
        $client = $this->client();

        $client->xmlHttpRequest('POST', str_replace('pyramid-1', 'raster-1', self::PUBLISH_URL), ['data' => json_encode($this->payload(), JSON_THROW_ON_ERROR)]);

        self::assertResponseStatusCodeSame(400);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testInvalidDescriptionAnswers422WithoutWriting(): void
    {
        $client = $this->client();

        foreach (['', str_repeat('a', 301)] as $description) {
            $this->post($client, ['description' => $description] + $this->payload());

            self::assertResponseStatusCodeSame(422);
            self::assertSame(['description'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        }
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
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

    /**
     * @param array<string, mixed> $payload
     */
    private function post(KernelBrowser $client, array $payload): void
    {
        $client->xmlHttpRequest('POST', self::PUBLISH_URL, ['data' => json_encode($payload, JSON_THROW_ON_ERROR)]);
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'title' => 'Mon flux',
            'technical_name' => 'SANDBOX.mon_flux',
            'description' => 'Hydrographie des Ardennes',
            'themes' => ['Hydrographie'],
            'access' => 'public',
            'attribution' => null,
        ];
    }
}
