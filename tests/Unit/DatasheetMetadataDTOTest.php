<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Dto\Datasheet\DatasheetMetadataDTO;
use PHPUnit\Framework\TestCase;

final class DatasheetMetadataDTOTest extends TestCase
{
    // la liste du formulaire et celle de la validation doivent rester identiques
    public function testScalesMatchTheFormList(): void
    {
        $formScales = json_decode((string) file_get_contents(__DIR__.'/../../assets/data/md_resolutions.json'), true, flags: JSON_THROW_ON_ERROR);

        self::assertSame($formScales, DatasheetMetadataDTO::SCALES);
    }
}
