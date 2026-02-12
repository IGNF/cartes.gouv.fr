<?php

namespace App\Services\FileUploader\Format\Zip;

use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Format\GeoJsonFormatHandler;
use App\Services\FileUploader\Format\UploadFormatHandlerInterface;
use App\Services\FileUploader\Srid\GpkgSridExtractor;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Response;

#[AutoconfigureTag('cartesgouvfr.file_uploader.format_handler')]
final class ZipFormatHandler implements UploadFormatHandlerInterface
{
    private const MAX_FILES = 10000;
    private const MAX_ENTRY_SIZE_BYTES = 1000000000; // 1GB par entrée
    private const MAX_RATIO = 20;

    public function __construct(
        private readonly Filesystem $filesystem,
        private readonly GpkgSridExtractor $gpkgSridExtractor,
        private readonly GeoJsonFormatHandler $geoJsonFormatHandler,
        private readonly ZipUploadPolicy $zipUploadPolicy,
    ) {
    }

    public function supports(string $extension): bool
    {
        return 'zip' === strtolower($extension);
    }

    public function validateAndExtractSrid(FinalizedUpload $upload, array $baseValidExtensions): string
    {
        $allowed = array_map('strtolower', $baseValidExtensions);
        if (!in_array('gpkg', $allowed, true) && !in_array('geojson', $allowed, true)) {
            throw new FileUploaderException("L'extension du fichier {$upload->originalFilename} n'est pas correcte", Response::HTTP_BAD_REQUEST);
        }

        $fileInfo = new \SplFileInfo($upload->absolutePath);

        $this->cleanArchive($fileInfo, $allowed);
        $family = $this->validateArchive($fileInfo);

        if ('gpkg' === $family) {
            $srids = $this->getSridsFromArchive($fileInfo);
            $unicity = array_values(array_unique($srids));
            if (!empty($unicity) && 1 !== count($unicity)) {
                throw new FileUploaderException('Ce fichier contient des données dans des systèmes de projection différents', Response::HTTP_BAD_REQUEST);
            }

            return (1 === count($unicity)) ? $unicity[0] : '';
        }

        // GeoJSON (RFC 7946) => WGS84
        $this->validateGeoJsonFromArchive($upload, $fileInfo, $baseValidExtensions);

        return 'EPSG:4326';
    }

    /**
     * Supprime les entrées dont l'extension n'est pas correcte (policy permissive + mutation).
     *
     * @param string[] $baseValidExtensions
     */
    private function cleanArchive(\SplFileInfo $file, array $baseValidExtensions): void
    {
        $zip = new \ZipArchive();
        if (!$zip->open($file->getPathname())) {
            throw new FileUploaderException("L'ouverture de l'archive {$file->getFilename()} a echoué", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $numDeletedFiles = 0;
        $numFilesBefore = $zip->numFiles;

        // Itérer à l'envers pour éviter les effets de bord quand on supprime des entrées
        for ($i = $zip->numFiles - 1; $i >= 0; --$i) {
            $entryName = $zip->getNameIndex($i);
            if (false === $entryName) {
                continue;
            }

            // dossier
            if ('/' === substr($entryName, -1)) {
                continue;
            }

            $extension = strtolower(pathinfo($entryName, PATHINFO_EXTENSION));
            if (!in_array($extension, $baseValidExtensions, true)) {
                $zip->deleteIndex($i);
                ++$numDeletedFiles;
            }
        }
        $zip->close();

        if ($numDeletedFiles >= $numFilesBefore) {
            throw new FileUploaderException("L'archive ne contient aucun fichier acceptable", Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Contrôles ZIP existants (ZipSlip, nb max, taille max par entrée, ratio compression, unicité type).
     *
     * @return 'gpkg'|'geojson'
     */
    private function validateArchive(\SplFileInfo $file): string
    {
        $zip = new \ZipArchive();
        if (!$zip->open($file->getPathname())) {
            throw new FileUploaderException("L'ouverture de l'archive {$file->getFilename()} a echoué", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $numFiles = 0;
        $extensions = [];

        for ($i = 0; $i < $zip->numFiles; ++$i) {
            $entryName = $zip->getNameIndex($i);
            if (false === $entryName) {
                continue;
            }

            // Précautions contre le ZipSlip path traversal (ex. https://medium.com/@ibm_ptc_security/zip-slip-attack-e3e63a13413f)
            if (
                false !== strpos($entryName, "\0")
                || false !== strpos($entryName, '\\')
                || 1 === preg_match('/^[a-zA-Z]:/', $entryName)
                || 1 === preg_match('#(^|/)\.\.(/|$)#', $entryName)
                || '/' === substr($entryName, 0, 1)
            ) {
                $zip->close();
                throw new FileUploaderException('Archive corrompu', Response::HTTP_BAD_REQUEST);
            }

            // dossier
            if ('/' === substr($entryName, -1)) {
                continue;
            }

            $stats = $zip->statIndex($i);
            ++$numFiles;
            if ($numFiles > self::MAX_FILES) {
                $zip->close();
                throw new FileUploaderException('Le nombre de fichiers excède '.self::MAX_FILES, Response::HTTP_BAD_REQUEST);
            }

            $extension = strtolower(pathinfo($entryName, PATHINFO_EXTENSION));
            $extensions[] = $extension;

            $size = $stats['size'] ?? 0;
            if ($size > self::MAX_ENTRY_SIZE_BYTES) {
                $zip->close();
                throw new FileUploaderException(sprintf('La taille du fichier %s excède %s GB', $entryName, self::MAX_ENTRY_SIZE_BYTES / 1000000000), Response::HTTP_BAD_REQUEST);
            }

            $compSize = $stats['comp_size'] ?? 0;
            if ($compSize) {
                $ratio = $size / $compSize;
                if ($ratio > self::MAX_RATIO) {
                    $zip->close();
                    throw new FileUploaderException('Le taux de compression excède '.self::MAX_RATIO, Response::HTTP_BAD_REQUEST);
                }
            }
        }

        $zip->close();

        try {
            return $this->zipUploadPolicy->detectFamilyFromExtensions($extensions);
        } catch (ZipUploadPolicyException $e) {
            throw new FileUploaderException($e->getMessage(), Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * @param array<int, string> $baseValidExtensions
     */
    private function validateGeoJsonFromArchive(FinalizedUpload $upload, \SplFileInfo $file, array $baseValidExtensions): void
    {
        $infos = pathinfo($file->getPathname());
        $dirname = $infos['dirname'];
        $tmpFolderName = $infos['filename'].'_tmp';

        $zip = new \ZipArchive();
        if (!$zip->open($file->getPathname())) {
            throw new FileUploaderException("l'ouverture du fichier ZIP a échoué", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $folder = "$dirname/$tmpFolderName";
        try {
            if (!$zip->extractTo($folder)) {
                throw new FileUploaderException("l'extraction du fichier ZIP a échoué", Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        } finally {
            $zip->close();
        }

        try {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($folder, \RecursiveDirectoryIterator::SKIP_DOTS)
            );

            $realFolder = realpath($folder);

            $validatedAny = false;
            foreach ($iterator as $entry) {
                if ($entry->isLink()) {
                    throw new FileUploaderException('Archive corrompu', Response::HTTP_BAD_REQUEST);
                }

                if (false !== $realFolder) {
                    $realPath = $entry->getRealPath();
                    if (false === $realPath || 0 !== strpos($realPath, $realFolder.DIRECTORY_SEPARATOR)) {
                        throw new FileUploaderException('Archive corrompu', Response::HTTP_BAD_REQUEST);
                    }
                }

                $extension = strtolower($entry->getExtension());
                if ('geojson' !== $extension) {
                    continue;
                }

                $validatedAny = true;
                $this->geoJsonFormatHandler->validateAndExtractSrid(
                    new FinalizedUpload($upload->uuid, $entry->getPathname(), $entry->getFilename()),
                    $baseValidExtensions
                );
            }

            if (!$validatedAny) {
                throw new FileUploaderException("L'archive ne contient aucun fichier acceptable", Response::HTTP_BAD_REQUEST);
            }
        } finally {
            $this->filesystem->remove($folder);
        }
    }

    /** @return string[] */
    private function getSridsFromArchive(\SplFileInfo $file): array
    {
        $infos = pathinfo($file->getPathname());
        $dirname = $infos['dirname'];
        $tmpFolderName = $infos['filename'].'_tmp';

        $zip = new \ZipArchive();
        if (!$zip->open($file->getPathname())) {
            throw new FileUploaderException("l'ouverture du fichier ZIP a échoué", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $folder = "$dirname/$tmpFolderName";
        try {
            if (!$zip->extractTo($folder)) {
                throw new FileUploaderException("l'extraction du fichier ZIP a échoué", Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        } finally {
            $zip->close();
        }

        $srids = [];
        try {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($folder, \RecursiveDirectoryIterator::SKIP_DOTS)
            );

            $realFolder = realpath($folder);

            foreach ($iterator as $entry) {
                if ($entry->isLink()) {
                    throw new FileUploaderException('Archive corrompu', Response::HTTP_BAD_REQUEST);
                }

                if (false !== $realFolder) {
                    $realPath = $entry->getRealPath();
                    if (false === $realPath || 0 !== strpos($realPath, $realFolder.DIRECTORY_SEPARATOR)) {
                        throw new FileUploaderException('Archive corrompu', Response::HTTP_BAD_REQUEST);
                    }
                }

                $extension = strtolower($entry->getExtension());
                if ('gpkg' !== $extension) {
                    continue;
                }

                $srids = array_merge($srids, $this->gpkgSridExtractor->extractSrids($entry->getPathname()));
            }
        } finally {
            $this->filesystem->remove($folder);
        }

        return $srids;
    }
}
