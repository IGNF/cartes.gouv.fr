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
        if (!is_file($upload->absolutePath)) {
            throw new FileUploaderException('Fichier SQL introuvable', Response::HTTP_BAD_REQUEST);
        }

        $file = new \SplFileInfo($upload->absolutePath);
        $size = $file->getSize();
        if (false === $size || 0 === $size) {
            throw new FileUploaderException("Le fichier {$upload->originalFilename} ne doit pas être vide", Response::HTTP_BAD_REQUEST);
        }

        $this->assertReadableTextFile($upload);

        return '';
    }

    private function assertReadableTextFile(FinalizedUpload $upload): void
    {
        $handle = fopen($upload->absolutePath, 'rb');
        if (false === $handle) {
            throw new FileUploaderException("Lecture du fichier {$upload->originalFilename} échouée", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        try {
            while (!feof($handle)) {
                $chunk = fread($handle, 8192);
                if (false === $chunk) {
                    throw new FileUploaderException("Lecture du fichier {$upload->originalFilename} échouée", Response::HTTP_INTERNAL_SERVER_ERROR);
                }
                if ('' === $chunk) {
                    break;
                }

                if (str_contains($chunk, "\0")) {
                    throw new FileUploaderException('SQL invalide (caractère NUL détecté)', Response::HTTP_BAD_REQUEST);
                }
            }
        } finally {
            fclose($handle);
        }
    }
}
