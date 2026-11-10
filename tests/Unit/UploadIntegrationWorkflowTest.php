<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Workflow\UploadIntegrationWorkflow;
use PHPUnit\Framework\TestCase;

final class UploadIntegrationWorkflowTest extends TestCase
{
    public function testBusinessTagsAreForwardedAndTechnicalTagsAreNot(): void
    {
        $forwarded = UploadIntegrationWorkflow::forwardedTags([
            'datasheet_name' => 'Fiche',
            'producer' => 'IGN',
            'producer_short' => 'IGN',
            'production_year' => '2026',
            'date' => '2026-03-01',
            'theme' => 'Hydrographie, Transports',
            'zone' => 'D001 Ain',
            'data_upload_path' => 'uuid/fichier.gpkg',
            'integration_progress' => '{}',
            'email_notification' => 'true',
        ]);

        self::assertSame([
            'datasheet_name' => 'Fiche',
            'producer' => 'IGN',
            'producer_short' => 'IGN',
            'production_year' => '2026',
            'date' => '2026-03-01',
            'theme' => 'Hydrographie, Transports',
            'zone' => 'D001 Ain',
        ], $forwarded);
    }

    public function testMissingOptionalTagsAreSkipped(): void
    {
        self::assertSame(['datasheet_name' => 'Fiche'], UploadIntegrationWorkflow::forwardedTags(['datasheet_name' => 'Fiche']));
    }
}
