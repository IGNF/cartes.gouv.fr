<?php

namespace App\Services\FileUploader\Srid;

use App\Services\FileUploader\Exception\FileUploaderException;
use Symfony\Component\HttpFoundation\Response;

final class GpkgSridExtractor
{
    public function __construct(private readonly WktAuthorityParser $authorityParser)
    {
    }

    /** @return string[] */
    public function extractSrids(string $filepath): array
    {
        if (!is_file($filepath)) {
            throw new FileUploaderException('Fichier GeoPackage introuvable', Response::HTTP_BAD_REQUEST);
        }

        $db = new \SQLite3($filepath);

        $res = $db->query('SELECT gc.table_name, rs.definition FROM gpkg_geometry_columns gc LEFT JOIN gpkg_spatial_ref_sys rs ON gc.srs_id = rs.srs_id');
        if (false === $res) {
            $db->close();
            throw new FileUploaderException('Impossible de lire le GeoPackage', Response::HTTP_BAD_REQUEST);
        }

        $srids = [];
        while ($row = $res->fetchArray()) {
            $definition = $row['definition'] ?? null;
            if (!is_string($definition)) {
                continue;
            }

            $srid = $this->authorityParser->extractAuthority($definition);
            if (null !== $srid) {
                $srids[] = $srid;
            }
        }

        $db->close();

        return $srids;
    }
}
