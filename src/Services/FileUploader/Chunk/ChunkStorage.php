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

    public function storeChunk(string $uuid, int $index, UploadedFile $chunk): int
    {
        if ($index < 1) {
            throw new FileUploaderException('Le paramètre [index] est invalide', Response::HTTP_BAD_REQUEST);
        }

        $directory = $this->pathResolver->getUploadDirectory($uuid);
        if (!$this->filesystem->exists($directory)) {
            $this->filesystem->mkdir($directory);
        }

        $size = $chunk->getSize();
        if (false === $size || null === $size) {
            throw new FileUploaderException('Impossible de déterminer la taille du chunk', Response::HTTP_BAD_REQUEST);
        }

        $serverFilename = sprintf('%s_%d', $uuid, $index);
        $chunk->move($directory, $serverFilename);

        return $size;
    }
}
