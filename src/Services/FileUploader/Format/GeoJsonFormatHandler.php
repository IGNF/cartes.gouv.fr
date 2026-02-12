<?php

namespace App\Services\FileUploader\Format;

use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Exception\FileUploaderException;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use Symfony\Component\HttpFoundation\Response;

#[AutoconfigureTag('cartesgouvfr.file_uploader.format_handler')]
final class GeoJsonFormatHandler implements UploadFormatHandlerInterface
{
    /**
     * Au-delà de cette taille, on évite de parser tout le JSON (risque mémoire)
     * et on fait seulement une vérification légère.
     *
     * Objectif: validations minimales côté serveur (structure générale) et laisser
     * les validations plus lourdes à l'API Entrepôt (volumétrie, géométries, etc.).
     */
    private const MAX_BYTES_TO_PARSE = 20000000; // 20 MB

    public function supports(string $extension): bool
    {
        $ext = strtolower($extension);

        return 'geojson' === $ext;
    }

    public function validateAndExtractSrid(FinalizedUpload $upload, array $baseValidExtensions): string
    {
        // Le contrôleur passe une liste d'extensions "de base" autorisées (sans le '.').
        // Ici on ne supporte que le GeoJSON en tant que fichier standalone: .geojson.
        $allowed = array_map('strtolower', $baseValidExtensions);
        if (!in_array('geojson', $allowed, true)) {
            throw new FileUploaderException("L'extension du fichier {$upload->originalFilename} n'est pas correcte", Response::HTTP_BAD_REQUEST);
        }

        $file = new \SplFileInfo($upload->absolutePath);
        $size = $file->getSize();
        if (false === $size || 0 === $size) {
            throw new FileUploaderException("Le fichier {$upload->originalFilename} ne doit pas être vide", Response::HTTP_BAD_REQUEST);
        }

        if ($size > self::MAX_BYTES_TO_PARSE) {
            // Pour les gros fichiers, on évite un json_decode() complet (risque de pic mémoire).
            // On vérifie seulement que le fichier ressemble à un objet JSON (préfixe '{').
            $this->lightweightValidate($upload);

            return 'EPSG:4326';
        }

        $contents = file_get_contents($upload->absolutePath);
        if (false === $contents) {
            throw new FileUploaderException("Lecture du fichier {$upload->originalFilename} échouée", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Certains fichiers JSON commencent par un BOM UTF-8, qui ferait échouer json_decode().
        if (0 === strncmp($contents, "\xEF\xBB\xBF", 3)) {
            $contents = substr($contents, 3);
        }

        try {
            $decoded = json_decode($contents, true, 512, \JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new FileUploaderException('GeoJSON invalide (JSON non valide)', Response::HTTP_BAD_REQUEST);
        }

        // On attend un objet JSON (associatif) en haut niveau, pas une liste.
        if (!is_array($decoded)) {
            throw new FileUploaderException('GeoJSON invalide (doit être un objet JSON)', Response::HTTP_BAD_REQUEST);
        }

        $type = $decoded['type'] ?? null;
        if (!is_string($type) || '' === trim($type)) {
            throw new FileUploaderException('GeoJSON invalide (champ "type" manquant)', Response::HTTP_BAD_REQUEST);
        }

        $allowedTypes = [
            'FeatureCollection',
            'Feature',
            'Point',
            'MultiPoint',
            'LineString',
            'MultiLineString',
            'Polygon',
            'MultiPolygon',
            'GeometryCollection',
        ];
        if (!in_array($type, $allowedTypes, true)) {
            throw new FileUploaderException('GeoJSON invalide (type non supporté)', Response::HTTP_BAD_REQUEST);
        }

        // Validations minimales de structure selon le type.
        // NB: on ne valide pas en profondeur les coordonnées / géométries ici.
        switch ($type) {
            case 'FeatureCollection':
                if (!array_key_exists('features', $decoded) || !is_array($decoded['features'])) {
                    throw new FileUploaderException('GeoJSON invalide ("features" attendu)', Response::HTTP_BAD_REQUEST);
                }
                break;
            case 'Feature':
                if (!array_key_exists('geometry', $decoded)) {
                    throw new FileUploaderException('GeoJSON invalide ("geometry" attendu)', Response::HTTP_BAD_REQUEST);
                }
                break;
            case 'GeometryCollection':
                if (!array_key_exists('geometries', $decoded) || !is_array($decoded['geometries'])) {
                    throw new FileUploaderException('GeoJSON invalide ("geometries" attendu)', Response::HTTP_BAD_REQUEST);
                }
                break;
            default:
                if (!array_key_exists('coordinates', $decoded)) {
                    throw new FileUploaderException('GeoJSON invalide ("coordinates" attendu)', Response::HTTP_BAD_REQUEST);
                }
                break;
        }

        // RFC 7946: le GeoJSON est en WGS84 (donc EPSG:4326).
        // On renvoie EPSG:4326 pour alimenter l'UI (pré-remplissage de la projection).
        return 'EPSG:4326';
    }

    private function lightweightValidate(FinalizedUpload $upload): void
    {
        // Lecture d'un petit préfixe du fichier uniquement, sans charger tout le contenu.
        // On vérifie que ça ressemble à un objet JSON (commence par '{' après espaces/BOM).
        $handle = fopen($upload->absolutePath, 'rb');
        if (false === $handle) {
            throw new FileUploaderException("Lecture du fichier {$upload->originalFilename} échouée", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        try {
            $head = fread($handle, 2048);
        } finally {
            fclose($handle);
        }

        if (false === $head) {
            throw new FileUploaderException("Lecture du fichier {$upload->originalFilename} échouée", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $trim = ltrim($head);
        // Gestion BOM UTF-8 éventuel au tout début du fichier
        if (0 === strncmp($trim, "\xEF\xBB\xBF", 3)) {
            $trim = substr($trim, 3);
            $trim = ltrim($trim);
        }
        if ('' === $trim || '{' !== $trim[0]) {
            throw new FileUploaderException('GeoJSON invalide (doit commencer par un objet JSON)', Response::HTTP_BAD_REQUEST);
        }
    }
}
