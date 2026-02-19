<?php

namespace App\Services\FileUploader\Format\Csv;

use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Format\UploadFormatHandlerInterface;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use Symfony\Component\HttpFoundation\Response;

#[AutoconfigureTag('cartesgouvfr.file_uploader.format_handler')]
final class CsvFormatHandler implements UploadFormatHandlerInterface
{
    private const GEOM_COLUMNS = ['json', 'geom', 'the_geom', 'wkb', 'wkt'];

    private const LON_COLUMNS = ['lon', 'x', 'longitude'];
    private const LAT_COLUMNS = ['lat', 'y', 'latitude'];

    // Pour inférer EPSG:4326 on ne se base que sur lon/lat explicites (pas x/y).
    private const LON_COLUMNS_4326 = ['lon', 'longitude'];
    private const LAT_COLUMNS_4326 = ['lat', 'latitude'];

    private const MAX_HEADER_BYTES = 1048576; // 1MB

    public function supports(string $extension): bool
    {
        return 'csv' === strtolower($extension);
    }

    public function validateAndExtractSrid(FinalizedUpload $upload, array $baseValidExtensions): string
    {
        if (!is_file($upload->absolutePath)) {
            throw new FileUploaderException('Fichier CSV introuvable', Response::HTTP_BAD_REQUEST);
        }

        $file = new \SplFileInfo($upload->absolutePath);
        $size = $file->getSize();
        if (false === $size || 0 === $size) {
            throw new FileUploaderException("Le fichier {$upload->originalFilename} ne doit pas être vide", Response::HTTP_BAD_REQUEST);
        }

        $headerColumns = $this->readHeaderColumns($upload);
        if (empty($headerColumns)) {
            throw new FileUploaderException('CSV invalide (en-tête manquant)', Response::HTTP_BAD_REQUEST);
        }

        $geomOk = $this->hasAnyColumn($headerColumns, self::GEOM_COLUMNS);
        $lonOk = $this->hasAnyColumn($headerColumns, self::LON_COLUMNS);
        $latOk = $this->hasAnyColumn($headerColumns, self::LAT_COLUMNS);

        if (!$geomOk && !($lonOk && $latOk)) {
            throw new FileUploaderException('CSV invalide (colonnes attendues: une colonne géométrie json|geom|the_geom|wkb|wkt, ou deux colonnes coordonnées lon|x|longitude + lat|y|latitude)', Response::HTTP_BAD_REQUEST);
        }

        // Inférence SRID: si la donnée est ponctuelle avec colonnes lon/lat explicites, on suppose EPSG:4326.
        $isLonLat = $this->hasAnyColumn($headerColumns, self::LON_COLUMNS_4326) && $this->hasAnyColumn($headerColumns, self::LAT_COLUMNS_4326);
        if ($isLonLat) {
            return 'EPSG:4326';
        }

        return '';
    }

    /**
     * @return string[] liste des noms de colonnes normalisés (trim + lowercase), BOM géré
     */
    private function readHeaderColumns(FinalizedUpload $upload): array
    {
        $handle = fopen($upload->absolutePath, 'rb');
        if (false === $handle) {
            throw new FileUploaderException("Lecture du fichier {$upload->originalFilename} échouée", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        try {
            $line = null;
            $readBytes = 0;

            while (!feof($handle)) {
                $chunk = fgets($handle);
                if (false === $chunk) {
                    break;
                }

                $readBytes += strlen($chunk);
                if ($readBytes > self::MAX_HEADER_BYTES) {
                    throw new FileUploaderException('CSV invalide (en-tête trop volumineux)', Response::HTTP_BAD_REQUEST);
                }

                // Ignorer lignes vides/espaces en début de fichier.
                if ('' === trim($chunk)) {
                    continue;
                }

                $line = $chunk;
                break;
            }
        } finally {
            fclose($handle);
        }

        if (!is_string($line) || '' === trim($line)) {
            return [];
        }

        // Retirer BOM UTF-8 éventuellement présent en tout début.
        if (0 === strncmp($line, "\xEF\xBB\xBF", 3)) {
            $line = substr($line, 3);
        }

        $delimiter = $this->detectDelimiter($line);
        $raw = str_getcsv($line, $delimiter);
        $cols = [];
        foreach ($raw as $i => $v) {
            if (!is_string($v)) {
                continue;
            }

            // BOM peut parfois se retrouver sur la première valeur selon encodage.
            if (0 === $i && 0 === strncmp($v, "\xEF\xBB\xBF", 3)) {
                $v = substr($v, 3);
            }

            $norm = strtolower(trim($v));
            if ('' !== $norm) {
                $cols[] = $norm;
            }
        }

        return array_values(array_unique($cols));
    }

    private function detectDelimiter(string $line): string
    {
        // Heuristique simple: choisir le séparateur le plus présent sur la ligne d'en-tête.
        $candidates = [',', ';', "\t", '|'];
        $best = ',';
        $bestCount = -1;

        foreach ($candidates as $d) {
            $count = substr_count($line, $d);
            if ($count > $bestCount) {
                $bestCount = $count;
                $best = $d;
            }
        }

        return $best;
    }

    /**
     * @param string[] $columns
     * @param string[] $expected
     */
    private function hasAnyColumn(array $columns, array $expected): bool
    {
        foreach ($expected as $name) {
            if (in_array($name, $columns, true)) {
                return true;
            }
        }

        return false;
    }
}
