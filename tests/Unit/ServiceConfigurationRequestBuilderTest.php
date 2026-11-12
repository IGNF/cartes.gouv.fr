<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Constants\EntrepotApi\ZoomLevels;
use App\Dto\Services\Wfs\WfsServiceDTO;
use App\Services\EntrepotApi\ServiceConfigurationRequestBuilder;
use PHPUnit\Framework\TestCase;

final class ServiceConfigurationRequestBuilderTest extends TestCase
{
    public function testPyramidWithoutLevelsGetsTheDefaultLevels(): void
    {
        $expected = ['bottom_level' => (string) ZoomLevels::BOTTOM_LEVEL_DEFAULT, 'top_level' => (string) ZoomLevels::TOP_LEVEL_DEFAULT];

        self::assertSame($expected, ServiceConfigurationRequestBuilder::getPyramidZoomLevels([]));
        self::assertSame($expected, ServiceConfigurationRequestBuilder::getPyramidZoomLevels(['type_infos' => ['levels' => []]]));
    }

    public function testPyramidLevelsAreSortedNumerically(): void
    {
        $levels = ServiceConfigurationRequestBuilder::getPyramidZoomLevels(['type_infos' => ['levels' => ['12', '5', '9', '10']]]);

        self::assertSame(['bottom_level' => '12', 'top_level' => '5'], $levels);
    }

    public function testClassicCreationSetsTheLayerNameAndTheAttribution(): void
    {
        $body = ServiceConfigurationRequestBuilder::buildFromCommonDto('WFS', $this->dto(attribution: true), ['k' => 'v']);

        self::assertSame([
            'name' => 'Service',
            'type' => 'WFS',
            'type_infos' => ['k' => 'v'],
            'layer_name' => 'tech',
            'attribution' => ['title' => 'IGN', 'url' => 'https://www.ign.fr'],
        ], $body);
    }

    public function testClassicEditKeepsTheMetadataAndNeverSendsTheLayerName(): void
    {
        $metadata = [['format' => 'application/xml', 'url' => 'https://csw.test', 'type' => 'ISOAP']];
        $body = ServiceConfigurationRequestBuilder::buildFromCommonDto('WFS', $this->dto(attribution: false), [], ['metadata' => $metadata]);

        self::assertSame(['name' => 'Service', 'type' => 'WFS', 'type_infos' => [], 'metadata' => $metadata], $body);
    }

    private function dto(bool $attribution): WfsServiceDTO
    {
        $dto = new WfsServiceDTO();
        $dto->technical_name = 'tech';
        $dto->service_name = 'Service';
        if ($attribution) {
            $dto->attribution_text = 'IGN';
            $dto->attribution_url = 'https://www.ign.fr';
        }

        return $dto;
    }
}
