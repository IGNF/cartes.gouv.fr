<?php

namespace App\Services\FileUploader\Format\Zip;

/**
 * Règles communes pour les ZIP: le ZIP ne doit contenir qu'une seule famille de données.
 * - GeoPackage: .gpkg
 * - GeoJSON: .geojson.
 */
final class ZipUploadPolicy
{
    public const FAMILY_GPKG = 'gpkg';
    public const FAMILY_GEOJSON = 'geojson';

    /** @var array<int, string> */
    private const ALLOWED_EXTENSIONS = ['gpkg', 'geojson'];

    public function isAllowedExtension(string $extension): bool
    {
        return in_array(strtolower($extension), self::ALLOWED_EXTENSIONS, true);
    }

    /**
     * @param array<int, string> $extensions Extensions observées dans le ZIP (sans point)
     *
     * @return self::FAMILY_*
     */
    public function detectFamilyFromExtensions(array $extensions): string
    {
        $clean = [];
        foreach ($extensions as $ext) {
            $ext = strtolower(trim($ext));
            if ('' === $ext) {
                continue;
            }
            $clean[] = $ext;
        }

        $clean = array_values(array_unique($clean));

        if (empty($clean)) {
            throw new ZipUploadPolicyException('Le fichier ZIP ne contient aucun fichier acceptable');
        }

        $gpkgOnly = empty(array_diff($clean, ['gpkg']));
        $geojsonOnly = empty(array_diff($clean, ['geojson']));

        if ($gpkgOnly) {
            return self::FAMILY_GPKG;
        }
        if ($geojsonOnly) {
            return self::FAMILY_GEOJSON;
        }

        throw new ZipUploadPolicyException('Le fichier ZIP ne doit contenir que des fichiers GeoPackage (.gpkg) ou GeoJSON (.geojson), pas un mélange');
    }
}
