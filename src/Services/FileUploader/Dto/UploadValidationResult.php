<?php

namespace App\Services\FileUploader\Dto;

final readonly class UploadValidationResult
{
    public function __construct(
        public string $srid,
        public string $relativeFilename,
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
