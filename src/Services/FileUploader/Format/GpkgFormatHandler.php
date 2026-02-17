<?php

namespace App\Services\FileUploader\Format;

use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Srid\SridCoherenceChecker;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use Symfony\Component\HttpFoundation\Response;

#[AutoconfigureTag('cartesgouvfr.file_uploader.format_handler')]
final class GpkgFormatHandler implements UploadFormatHandlerInterface
{
    private const TABLE_NAME_PATTERN = '/^[a-zA-Z_][ A-Za-z0-9_]*$/';

    public function __construct(
        private readonly SridCoherenceChecker $sridCoherenceChecker,
    ) {
    }

    public function supports(string $extension): bool
    {
        return 'gpkg' === strtolower($extension);
    }

    public function validateAndExtractSrid(FinalizedUpload $upload, array $baseValidExtensions): string
    {
        if (!is_file($upload->absolutePath)) {
            throw new FileUploaderException('Fichier GeoPackage introuvable', Response::HTTP_BAD_REQUEST);
        }

        $db = new \SQLite3($upload->absolutePath);

        try {
            $res = $db->query('SELECT gc.table_name, rs.definition FROM gpkg_geometry_columns gc LEFT JOIN gpkg_spatial_ref_sys rs ON gc.srs_id = rs.srs_id');
            if (false === $res) {
                throw new FileUploaderException('Impossible de lire le GeoPackage', Response::HTTP_BAD_REQUEST);
            }

            $srids = [];
            while ($row = $res->fetchArray(\SQLITE3_ASSOC)) {
                $tableName = $row['table_name'] ?? null;
                if (!is_string($tableName) || !$this->isValidTableName($tableName)) {
                    throw new FileUploaderException(sprintf('GeoPackage invalide (nom de table invalide : %s)', is_string($tableName) ? $tableName : 'inconnu'), Response::HTTP_BAD_REQUEST);
                }

                $definition = $row['definition'] ?? null;
                if (!is_string($definition)) {
                    continue;
                }

                $srid = $this->extractAuthority($definition);
                if (null !== $srid) {
                    $srids[] = $srid;
                }
            }

            return $this->sridCoherenceChecker->assertAndGetSingleSrid($srids);
        } finally {
            $db->close();
        }
    }

    private function isValidTableName(string $tableName): bool
    {
        return 1 === preg_match(self::TABLE_NAME_PATTERN, $tableName);
    }

    private function extractAuthority(string $definition): ?string
    {
        $wkt = preg_replace_callback('/[A-Z][A-Z\d_]+\[/i', function ($matches) {
            return '["'.substr($matches[0], 0, strlen($matches[0]) - 1).'",';
        }, $definition);

        $wkt = preg_replace_callback('/, ?([A-Z][A-Z\d_]+[,\]])/', function ($matches) {
            $v = substr($matches[0], 1, strlen($matches[0]) - 2);

            return ',"'.$v.'"]';
        }, $wkt);

        $json = json_decode($wkt, true);
        if (!is_array($json)) {
            return null;
        }

        foreach ($json as $v) {
            if (is_array($v) && isset($v[0], $v[1], $v[2]) && 'AUTHORITY' == $v[0]) {
                return $v[1].':'.$v[2];
            }
        }

        return null;
    }
}
