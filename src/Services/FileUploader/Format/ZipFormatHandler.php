<?php

namespace App\Services\FileUploader\Format;

use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Srid\GpkgSridExtractor;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Response;

#[AutoconfigureTag('cartesgouvfr.file_uploader.format_handler')]
final class ZipFormatHandler implements UploadFormatHandlerInterface
{
    private const MAX_FILES = 10000;
    private const MAX_ENTRY_SIZE_BYTES = 1000000000; // 1GB par entrée (comportement actuel)
    private const MAX_RATIO = 20;

    public function __construct(
        private readonly Filesystem $filesystem,
        private readonly GpkgSridExtractor $gpkgSridExtractor,
    ) {
    }

    public function supports(string $extension): bool
    {
        return 'zip' === strtolower($extension);
    }

    public function validateAndExtractSrid(FinalizedUpload $upload, array $baseValidExtensions): string
    {
        if (!in_array('gpkg', $baseValidExtensions, true)) {
            throw new FileUploaderException("L'extension du fichier {$upload->originalFilename} n'est pas correcte", Response::HTTP_BAD_REQUEST);
        }

        $fileInfo = new \SplFileInfo($upload->absolutePath);

        $this->cleanArchive($fileInfo, $baseValidExtensions);
        $this->validateArchive($fileInfo);

        $srids = $this->getSridsFromArchive($fileInfo);
        $unicity = array_values(array_unique($srids));
        if (!empty($unicity) && 1 !== count($unicity)) {
            throw new FileUploaderException('Ce fichier contient des données dans des systèmes de projection différents', Response::HTTP_BAD_REQUEST);
        }

        return (1 === count($unicity)) ? $unicity[0] : '';
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
     */
    private function validateArchive(\SplFileInfo $file): void
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

            // Prevent ZipSlip path traversal (comportement actuel)
            if (false !== strpos($entryName, '../') || '/' === substr($entryName, 0, 1)) {
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

        $unicity = array_unique($extensions);
        if (1 !== count($unicity)) {
            throw new FileUploaderException(sprintf("L'archive ne doit contenir qu'un seul type de fichier (%s)", implode(' ou ', ['gpkg'])), Response::HTTP_BAD_REQUEST);
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

            foreach ($iterator as $entry) {
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
