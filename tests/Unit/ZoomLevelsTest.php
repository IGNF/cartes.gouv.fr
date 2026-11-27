<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Constants\EntrepotApi\ZoomLevels;
use PHPUnit\Framework\TestCase;

final class ZoomLevelsTest extends TestCase
{
    public function testServerBoundsMatchTheFormSliders(): void
    {
        $defaults = json_decode((string) file_get_contents(__DIR__.'/../../assets/data/ol-defaults.json'), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(['TOP' => ZoomLevels::MIN, 'BOTTOM' => ZoomLevels::MAX], $defaults['zoom_levels']);
    }
}
