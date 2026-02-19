<?php

namespace App\Services\FileUploader\Format\Zip;

use App\Services\FileUploader\Format\Catalog\SupportedUploadFormatsCatalog;
use App\Services\FileUploader\Format\Catalog\SupportedUploadFormatsCatalogException;

/**
 * Règles communes pour les ZIP: le ZIP ne doit contenir qu'une seule famille de données.
 * - GeoPackage: .gpkg
 * - GeoJSON: .geojson.
 */
final class ZipUploadPolicy
{
    public function __construct(private readonly SupportedUploadFormatsCatalog $catalog)
    {
    }

    /**
     * Vérifie l'extension simple (pathinfo) d'une entrée ZIP.
     *
     * Note: ne permet pas de détecter certains suffixes spéciaux (ex: .shp.xml).
     * Pour les entrées ZIP, préférer isAllowedEntryName().
     */
    public function isAllowedExtension(string $extension): bool
    {
        $extension = strtolower($extension);

        return in_array($extension, $this->catalog->getZipAllowedExtensions(), true);
    }

    /**
     * Vérifie une entrée ZIP par son nom complet (permet .shp.xml, etc.).
     */
    public function isAllowedEntryName(string $entryName): bool
    {
        return $this->catalog->isAllowedZipEntryName($entryName);
    }

    /**
     * @param array<int, string> $extensions Extensions observées dans le ZIP (sans point)
     */
    public function detectFamilyFromExtensions(array $extensions): string
    {
        try {
            return $this->catalog->detectZipFamilyFromTokens($extensions);
        } catch (SupportedUploadFormatsCatalogException $e) {
            throw new ZipUploadPolicyException($e->getMessage());
        }
    }

    /**
     * @param array<int, string> $entryNames Noms complets des entrées (ex: dossier/roads.shp.xml)
     */
    public function detectFamilyFromEntryNames(array $entryNames): string
    {
        try {
            return $this->catalog->detectZipFamilyFromEntryNames($entryNames);
        } catch (SupportedUploadFormatsCatalogException $e) {
            throw new ZipUploadPolicyException($e->getMessage());
        }
    }
}
