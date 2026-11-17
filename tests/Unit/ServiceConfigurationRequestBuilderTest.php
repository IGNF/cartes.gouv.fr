<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Constants\EntrepotApi\ZoomLevels;
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
}
