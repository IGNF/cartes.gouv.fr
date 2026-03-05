<?php

namespace App\Services\FileUploader\Dto;

final class FinalizedUpload
{
    public function __construct(
        public readonly string $uuid,
        public readonly string $absolutePath,
        public readonly string $originalFilename,
    ) {
    }
}
