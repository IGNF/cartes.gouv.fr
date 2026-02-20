<?php

namespace App\Services\FileUploader\Chunk;

use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Path\UploadPathResolver;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

final class ChunkStorage
{
    public function __construct(
        private readonly UploadPathResolver $pathResolver,
        private readonly Filesystem $filesystem,
    ) {
    }

    /** @return string[] chunk filenames (ex: <uuid>_1) */
    public function listChunkFiles(string $uuid): array
    {
        $directory = $this->pathResolver->getUploadDirectory($uuid);

        if (!$this->filesystem->exists($directory) || !is_dir($directory)) {
            return [];
        }

        return $this->listChunkFilesInDirectory($directory, $uuid);
    }

    /**
     * @return string[] chunk filenames
     */
    public function assertAndListChunks(string $uuid, ?int $expectedTotalChunks): array
    {
        $directory = $this->pathResolver->getUploadDirectory($uuid);

        if (!$this->filesystem->exists($directory) || !is_dir($directory)) {
            throw new FileUploaderException('Aucun chunk trouvé pour cet upload', Response::HTTP_BAD_REQUEST);
        }

        $chunkFiles = $this->listChunkFilesInDirectory($directory, $uuid);

        if (null !== $expectedTotalChunks) {
            if ($expectedTotalChunks < 1) {
                throw new FileUploaderException('Le paramètre [totalChunks] est invalide', Response::HTTP_BAD_REQUEST);
            }

            $missing = [];
            $expectedFiles = [];
            for ($i = 1; $i <= $expectedTotalChunks; ++$i) {
                $name = ChunkFilename::build($uuid, $i);
                if (!in_array($name, $chunkFiles, true)) {
                    $missing[] = $i;
                    continue;
                }

                $expectedFiles[] = $name;
            }

            if (!empty($missing)) {
                $preview = array_slice($missing, 0, 20);
                $suffix = count($missing) > 20 ? '…' : '';
                throw new FileUploaderException(sprintf('Des chunks sont manquants (%d/%d): %s%s', count($missing), $expectedTotalChunks, implode(', ', $preview), $suffix), Response::HTTP_BAD_REQUEST);
            }

            $extra = array_values(array_diff($chunkFiles, $expectedFiles));

            if (!empty($extra)) {
                $preview = array_slice($extra, 0, 20);
                $suffix = count($extra) > 20 ? '…' : '';
                throw new FileUploaderException(sprintf('Des chunks inattendus ont été détectés (%d): %s%s', count($extra), implode(', ', $preview), $suffix), Response::HTTP_BAD_REQUEST);
            }

            return $expectedFiles;
        }

        if (empty($chunkFiles)) {
            throw new FileUploaderException('Aucun chunk trouvé pour cet upload', Response::HTTP_BAD_REQUEST);
        }

        return $chunkFiles;
    }

    public function storeChunk(string $uuid, int $index, UploadedFile $chunk): int
    {
        if ($index < 1) {
            throw new FileUploaderException('Le paramètre [index] est invalide', Response::HTTP_BAD_REQUEST);
        }

        $directory = $this->pathResolver->getUploadDirectory($uuid);
        if ($this->filesystem->exists($directory) && !is_dir($directory)) {
            throw new FileUploaderException('Le dossier de destination est invalide', Response::HTTP_BAD_REQUEST);
        }

        if (!$this->filesystem->exists($directory)) {
            $this->filesystem->mkdir($directory);
        }

        $size = $chunk->getSize();
        if (false === $size || null === $size) {
            throw new FileUploaderException('Impossible de déterminer la taille du chunk', Response::HTTP_BAD_REQUEST);
        }

        $serverFilename = ChunkFilename::build($uuid, $index);
        $chunk->move($directory, $serverFilename);

        return $size;
    }

    /** @return string[] */
    private function listChunkFilesInDirectory(string $directory, string $uuid): array
    {
        $filesOnDisk = array_filter(scandir($directory) ?: [], function (string $filename) use ($directory) {
            return !is_dir("$directory/$filename");
        });

        $pattern = ChunkFilename::patternForUuid($uuid);
        $files = [];
        foreach ($filesOnDisk as $filename) {
            if (preg_match($pattern, $filename)) {
                $files[] = $filename;
            }
        }

        return $files;
    }
}
