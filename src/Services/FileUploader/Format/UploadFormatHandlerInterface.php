<?php

namespace App\Services\FileUploader\Format;

use App\Services\FileUploader\Dto\FinalizedUpload;

interface UploadFormatHandlerInterface
{
    public function supports(string $extension): bool;

    /**
     * @param string[] $baseValidExtensions extensions such as ["gpkg"], without dot
     */
    public function validateAndExtractSrid(FinalizedUpload $upload, array $baseValidExtensions): string;
}
