<?php

namespace App\Services\FileUploader\Dto;

final class UploadValidationResult
{
    public function __construct(
        public readonly string $srid,
        public readonly string $relativeFilename,
    ) {
    }

    /** @return array{srid: string, filename: string} */
    public function toArray(): array
    {
        return [
            'srid' => $this->srid,
            'filename' => $this->relativeFilename,
        ];
    }
}
