<?php

namespace App\Tests\Functional;

use App\Services\CswMetadataHelper;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class CswMetadataHelperTest extends KernelTestCase
{
    public function testLegacyQuaterlyFrequencyIsReadAsQuarterly(): void
    {
        $xml = str_replace('codeListValue="monthly"', 'codeListValue="quaterly"', (string) file_get_contents(__DIR__.'/../Fixture/metadata/md-1.xml'));

        $cswMetadata = self::getContainer()->get(CswMetadataHelper::class)->fromXml($xml);

        self::assertSame('quarterly', $cswMetadata->frequencyCode);
    }
}
