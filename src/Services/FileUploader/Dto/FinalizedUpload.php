<?php

namespace App\Services\FileUploader\Dto;

final readonly class FinalizedUpload
{
    public function __construct(
        public string $uuid,
        public string $absolutePath,
        public string $originalFilename,
    ) {
    }
}
