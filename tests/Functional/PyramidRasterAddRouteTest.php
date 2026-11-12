<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Génération d’une pyramide raster depuis un flux WMS-Vecteur : charge utile validée avant tout appel à l’Entrepôt.
 */
final class PyramidRasterAddRouteTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const ADD_URL = self::BASE.'/api/datastores/'.EntrepotMockResponseFactory::DATASTORE_ID.'/pyramid-raster/add';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
    }

    public function testInvalidPayloadAnswers422WithTheirPathsWithoutWriting(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::ADD_URL, server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'technical_name' => '',
            'wmsv_offering_id' => 'pas-un-uuid',
            'wmsv_config_bbox' => '',
            'zoom_range' => [4],
        ], JSON_THROW_ON_ERROR));

        self::assertResponseStatusCodeSame(422);
        $paths = array_column($this->jsonResponse($client)['violations'], 'propertyPath');
        sort($paths);
        self::assertSame(['technical_name', 'wmsv_config_bbox', 'wmsv_offering_id', 'zoom_range'], $paths);
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }

    public function testZoomLevelsOutsideTheSliderBoundsAnswer422(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::ADD_URL, server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'technical_name' => 'pyramide',
            'wmsv_offering_id' => '0f8e3c2a-1b2c-4d5e-8f90-123456789abc',
            'wmsv_config_bbox' => 'POLYGON((0 0,1 0,1 1,0 0))',
            'zoom_range' => [0, 19],
        ], JSON_THROW_ON_ERROR));

        self::assertResponseStatusCodeSame(422);
        self::assertSame(['zoom_range[0]', 'zoom_range[1]'], array_column($this->jsonResponse($client)['violations'], 'propertyPath'));
        self::assertSame([], EntrepotMockResponseFactory::writeRequests());
    }
}
