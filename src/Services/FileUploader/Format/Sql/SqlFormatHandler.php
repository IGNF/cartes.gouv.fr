<?php

namespace App\Services\FileUploader\Format\Sql;

use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Format\UploadFormatHandlerInterface;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use Symfony\Component\HttpFoundation\Response;

#[AutoconfigureTag('cartesgouvfr.file_uploader.format_handler')]
final class SqlFormatHandler implements UploadFormatHandlerInterface
{
    public function supports(string $extension): bool
    {
        return 'sql' === strtolower($extension);
    }

    public function validateAndExtractSrid(FinalizedUpload $upload, array $baseValidExtensions): string
    {
        throw new FileUploaderException('Not implemented', Response::HTTP_NOT_IMPLEMENTED);
    }
}
