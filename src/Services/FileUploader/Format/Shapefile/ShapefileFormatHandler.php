<?php

namespace App\Services\FileUploader\Format\Shapefile;

use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Format\UploadFormatHandlerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use Symfony\Component\HttpFoundation\Response;

#[AutoconfigureTag('cartesgouvfr.file_uploader.format_handler')]
final class ShapefileFormatHandler implements UploadFormatHandlerInterface
{
    public function __construct(private readonly LoggerInterface $logger)
    {
    }

    private const MAX_PRJ_SIZE_BYTES = 1000000; // 1 Mo

    /**
     * Shapefile est un format multi-fichiers; on utilise "shp" comme extension principale.
     */
    public function supports(string $extension): bool
    {
        return 'shp' === strtolower($extension);
    }

    public function validateAndExtractSrid(FinalizedUpload $upload, array $baseValidExtensions): string
    {
        $fileInfo = new \SplFileInfo($upload->absolutePath);

        if ('shp' !== strtolower($fileInfo->getExtension())) {
            throw new FileUploaderException("Le fichier {$fileInfo->getFilename()} n'est pas un .shp", Response::HTTP_BAD_REQUEST);
        }

        if (!$fileInfo->isFile()) {
            throw new FileUploaderException("Le fichier {$fileInfo->getFilename()} est introuvable", Response::HTTP_BAD_REQUEST);
        }

        $directory = $fileInfo->getPath();
        $basename = $fileInfo->getBasename('.shp');

        $shx = $directory.DIRECTORY_SEPARATOR.$basename.'.shx';
        $dbf = $directory.DIRECTORY_SEPARATOR.$basename.'.dbf';
        $prj = $directory.DIRECTORY_SEPARATOR.$basename.'.prj';

        if (!is_file($shx)) {
            throw new FileUploaderException("Shapefile incomplet : fichier {$basename}.shx manquant", Response::HTTP_BAD_REQUEST);
        }

        if (!is_file($dbf)) {
            throw new FileUploaderException("Shapefile incomplet : fichier {$basename}.dbf manquant", Response::HTTP_BAD_REQUEST);
        }

        // .prj est optionnel: si absent ou non interprétable, on retourne "" et l'utilisateur choisira la projection.
        if (!is_file($prj)) {
            return '';
        }

        $size = filesize($prj);
        if (false !== $size && $size > self::MAX_PRJ_SIZE_BYTES) {
            throw new FileUploaderException("Le fichier {$prj} est trop volumineux", Response::HTTP_BAD_REQUEST);
        }

        $wkt = file_get_contents($prj);
        if (false === $wkt) {
            return '';
        }

        $authority = $this->extractAuthorityFromPrjWkt($wkt);
        if (null !== $authority) {
            $this->logger->debug("SRID extracted from .prj AUTHORITY or ID: {$authority}", ['file' => $upload->originalFilename]);

            return $authority;
        }

        // Cas fréquents : PRJ sans AUTHORITY/ID explicite.
        $fallback = $this->guessSridFromPrjWkt($wkt);
        $this->logger->debug("SRID guessed: {$fallback}", ['file' => $upload->originalFilename]);

        return $fallback ?? '';
    }

    private function extractAuthorityFromPrjWkt(string $wkt): ?string
    {
        // WKT1 : AUTHORITY["EPSG","4326"]
        // WKT2 : ID["EPSG",4326]
        if (1 === preg_match('/\b(?:AUTHORITY|ID)\s*\[\s*"([A-Z0-9_]+)"\s*,\s*"?([A-Z0-9_]+)"?\s*\]/i', $wkt, $matches)) {
            return strtoupper($matches[1]).':'.$matches[2];
        }

        return null;
    }

    private function guessSridFromPrjWkt(string $wkt): ?string
    {
        $upper = strtoupper($wkt);

        // Forme fréquente (ESRI) pour du WGS84 en géographique.
        if (
            false !== strpos($upper, 'GEOGCS["GCS_WGS_1984"')
            || false !== strpos($upper, 'DATUM["D_WGS_1984"')
            || false !== strpos($upper, 'SPHEROID["WGS_1984"')
        ) {
            return 'EPSG:4326';
        }

        if (
            false !== strpos($upper, 'PROJCS["RGF93_Lambert_93"')
            || false !== strpos($upper, 'GEOGCS["GCS_RGF_1993"')
            || false !== strpos($upper, 'DATUM["D_RGF_1993"')
        ) {
            return 'EPSG:2154';
        }

        return null;
    }
}
