<?php

namespace App\Services\FileUploader\Validation;

use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Dto\UploadValidationResult;
use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Format\FormatHandlerRegistry;
use App\Services\FileUploader\Path\UploadPathResolver;
use Symfony\Component\HttpFoundation\Response;

final class UploadValidationService
{
    private const MAX_UPLOAD_SIZE_BYTES = 2000000000; // 2GB

    public function __construct(
        private readonly FormatHandlerRegistry $formatRegistry,
        private readonly UploadPathResolver $pathResolver,
    ) {
    }

    /**
     * @param string[] $baseValidExtensions
     */
    public function validate(FinalizedUpload $upload, array $baseValidExtensions): UploadValidationResult
    {
        $file = new \SplFileInfo($upload->absolutePath);
        $filename = $file->getFilename();

        $size = $file->getSize();
        if (false === $size) {
            throw new FileUploaderException("Impossible de lire la taille du fichier $filename", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        if (0 === $size) {
            throw new FileUploaderException("Le fichier $filename ne doit pas être vide", Response::HTTP_BAD_REQUEST);
        }

        if ($size > self::MAX_UPLOAD_SIZE_BYTES) {
            throw new FileUploaderException("La taille du fichier $filename excède ".(self::MAX_UPLOAD_SIZE_BYTES / 1000000000).' Go', Response::HTTP_BAD_REQUEST);
        }

        $extension = strtolower($file->getExtension());
        $validExtensions = array_merge($baseValidExtensions, ['zip']);
        if (!in_array($extension, $validExtensions, true)) {
            throw new FileUploaderException("L'extension du fichier $filename n'est pas correcte", Response::HTTP_BAD_REQUEST);
        }

        $handler = $this->formatRegistry->getForExtension($extension);
        $srid = $handler->validateAndExtractSrid($upload, $baseValidExtensions);

        $relative = $this->pathResolver->toRelativeUploadPath($upload->uuid, $filename);

        return new UploadValidationResult($srid, $relative);
    }
}
