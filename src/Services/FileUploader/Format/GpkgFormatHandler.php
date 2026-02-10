<?php

namespace App\Services\FileUploader\Format;

use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Srid\GpkgSridExtractor;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use Symfony\Component\HttpFoundation\Response;

#[AutoconfigureTag('cartesgouvfr.file_uploader.format_handler')]
final class GpkgFormatHandler implements UploadFormatHandlerInterface
{
    public function __construct(private readonly GpkgSridExtractor $sridExtractor)
    {
    }

    public function supports(string $extension): bool
    {
        return 'gpkg' === strtolower($extension);
    }

    public function validateAndExtractSrid(FinalizedUpload $upload, array $baseValidExtensions): string
    {
        if (!in_array('gpkg', $baseValidExtensions, true)) {
            throw new FileUploaderException("L'extension du fichier {$upload->originalFilename} n'est pas correcte", Response::HTTP_BAD_REQUEST);
        }

        $srids = $this->sridExtractor->extractSrids($upload->absolutePath);
        $unicity = array_values(array_unique($srids));
        if (!empty($unicity) && 1 !== count($unicity)) {
            throw new FileUploaderException('Ce fichier contient des données dans des systèmes de projection différents', Response::HTTP_BAD_REQUEST);
        }

        return (1 === count($unicity)) ? $unicity[0] : '';
    }
}
