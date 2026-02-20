<?php

namespace App\Services\FileUploader\Format\Catalog;

/**
 * Source de vérité unique pour:
 * - extensions acceptées en upload direct
 * - extensions acceptées dans un ZIP
 * - détection de la « famille » d'un ZIP (un seul type de données)
 * - exigences des formats multi-fichiers (ex. Shapefile)
 */
final class SupportedUploadFormatsCatalog
{
    public const FAMILY_GPKG = 'gpkg';
    public const FAMILY_GEOJSON = 'geojson';
    public const FAMILY_SHAPEFILE = 'shapefile';
    public const FAMILY_CSV = 'csv';
    public const FAMILY_SQL = 'sql';

    /**
     * Formats acceptés en upload direct (sans ZIP).
     *
     * @return string[] extensions en minuscules, sans point
     */
    public function getDirectExtensions(): array
    {
        return [
            'gpkg',
            'geojson',
            'csv',
            'sql',
        ];
    }

    /**
     * Extensions autorisées dans un ZIP (contrôle simple via pathinfo).
     *
     * Important: certains cas ne sont pas exprimables via pathinfo(., PATHINFO_EXTENSION)
     * (ex: "shp.xml"). Pour ces cas, utiliser isAllowedZipEntryName().
     *
     * @return string[] extensions en minuscules, sans point
     */
    public function getZipAllowedExtensions(): array
    {
        return [
            // mono-fichier
            'gpkg',
            'geojson',
            'csv',
            'sql',

            // shapefile (multi-fichier)
            'shp',
            'shx',
            'dbf',
            'prj',
            'sbn',
            'sbx',
            'fbn',
            'fbx',
            'ain',
            'aih',
            'ixs',
            'mxs',
            'atx',
            'cpg',
            'qix',
        ];
    }

    /**
     * Autorise une entrée ZIP (nom complet) en tenant compte des cas spéciaux (ex: .shp.xml).
     */
    public function isAllowedZipEntryName(string $entryName): bool
    {
        $entryName = strtolower($entryName);

        if (str_ends_with($entryName, '/')) {
            return false;
        }

        if ($this->isShpXml($entryName)) {
            return true;
        }

        $extension = strtolower(pathinfo($entryName, PATHINFO_EXTENSION));

        return '' !== $extension && in_array($extension, $this->getZipAllowedExtensions(), true);
    }

    /**
     * Détecte la famille d'un ZIP à partir des noms d'entrées (fichiers) et vérifie les exigences minimales.
     *
     * Règle: le ZIP ne doit contenir qu'une seule famille (pas de mélange).
     * Les formats multi-fichiers doivent contenir toutes les extensions obligatoires.
     *
     * @param string[] $entryNames
     */
    public function detectZipFamilyFromEntryNames(array $entryNames): string
    {
        $tokens = [];
        foreach ($entryNames as $entryName) {
            $token = $this->zipEntryNameToToken($entryName);
            if (null === $token) {
                continue;
            }
            $tokens[] = $token;
        }

        return $this->detectZipFamilyFromTokens($tokens);
    }

    /**
     * Détecte la famille d'un ZIP à partir d'une liste de tokens d'extensions.
     *
     * Tokens attendus: "gpkg", "geojson", "csv", "sql", "shp", "dbf", etc.
     * Cas particulier: "shp.xml" (token dédié).
     *
     * @param string[] $tokens
     */
    public function detectZipFamilyFromTokens(array $tokens): string
    {
        $tokens = array_values(array_unique(array_map('strtolower', array_filter($tokens, static fn (string $v) => '' !== $v))));

        if (empty($tokens)) {
            throw new SupportedUploadFormatsCatalogException("L'archive ne contient aucun fichier acceptable");
        }

        $candidates = [];
        foreach ($this->getZipFamilies() as $family => $def) {
            if (!$this->tokenSetFitsFamily($tokens, $def['allowed'])) {
                continue;
            }

            if (!$this->requiredSetIsPresent($tokens, $def['required'])) {
                continue;
            }

            $candidates[] = $family;
        }

        if (1 === count($candidates)) {
            return $candidates[0];
        }

        if (empty($candidates)) {
            // Cas fréquent: mélange de familles, ou shapefile incomplet
            throw new SupportedUploadFormatsCatalogException("Le ZIP ne doit contenir qu'un seul format de données");
        }

        // Ne devrait pas arriver avec des familles disjointes + required non-vide, mais on protège.
        throw new SupportedUploadFormatsCatalogException('Le contenu du ZIP est ambigu');
    }

    /**
     * Retourne la liste des extensions requises pour une famille (ex: shapefile: shp+shx+dbf).
     *
     * @return string[]
     */
    public function getZipFamilyRequiredTokens(string $family): array
    {
        $families = $this->getZipFamilies();
        if (!isset($families[$family])) {
            throw new SupportedUploadFormatsCatalogException("Famille ZIP inconnue: $family");
        }

        return $families[$family]['required'];
    }

    /**
     * Convertit un nom d'entrée ZIP en token (extension) pour la détection de famille.
     *
     * - Ignore les dossiers
     * - "*.shp.xml" => token "shp.xml"
     * - sinon => token = pathinfo extension
     */
    private function zipEntryNameToToken(string $entryName): ?string
    {
        $entryName = strtolower($entryName);

        if (str_ends_with($entryName, '/')) {
            return null;
        }

        if ($this->isShpXml($entryName)) {
            return 'shp.xml';
        }

        $extension = strtolower(pathinfo($entryName, PATHINFO_EXTENSION));

        return '' !== $extension ? $extension : null;
    }

    private function isShpXml(string $entryNameLower): bool
    {
        return str_ends_with($entryNameLower, '.shp.xml');
    }

    /**
     * @return array<string, array{allowed: string[], required: string[]}>
     */
    private function getZipFamilies(): array
    {
        return [
            self::FAMILY_GPKG => [
                'allowed' => ['gpkg'],
                'required' => ['gpkg'],
            ],
            self::FAMILY_GEOJSON => [
                'allowed' => ['geojson'],
                'required' => ['geojson'],
            ],
            self::FAMILY_CSV => [
                'allowed' => ['csv'],
                'required' => ['csv'],
            ],
            self::FAMILY_SQL => [
                'allowed' => ['sql'],
                'required' => ['sql'],
            ],
            self::FAMILY_SHAPEFILE => [
                // shp.xml est accepté mais optionnel
                'allowed' => ['shp', 'shx', 'dbf', 'prj', 'sbn', 'sbx', 'fbn', 'fbx', 'ain', 'aih', 'ixs', 'mxs', 'atx', 'cpg', 'qix', 'shp.xml'],
                'required' => ['shp', 'shx', 'dbf'],
            ],
        ];
    }

    /**
     * @param string[] $tokens
     * @param string[] $allowed
     */
    private function tokenSetFitsFamily(array $tokens, array $allowed): bool
    {
        foreach ($tokens as $token) {
            if (!in_array($token, $allowed, true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param string[] $tokens
     * @param string[] $required
     */
    private function requiredSetIsPresent(array $tokens, array $required): bool
    {
        foreach ($required as $req) {
            if (!in_array($req, $tokens, true)) {
                return false;
            }
        }

        return true;
    }
}
