<?php

namespace App\Services\FileUploader\Chunk;

use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Path\UploadPathResolver;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Response;

final class ChunkMerger
{
    public function __construct(
        private readonly UploadPathResolver $pathResolver,
        private readonly ChunkFilenameIndexParser $indexParser,
        private readonly Filesystem $filesystem,
    ) {
    }

    /**
     * @param string[] $files nom des fichiers
     */
    public function merge(string $uuid, string $originalFilename, array $files): string
    {
        $directory = $this->pathResolver->getUploadDirectory($uuid);
        $files = $this->sortFiles($files);

        $finalPath = $this->pathResolver->getFinalPath($uuid, $originalFilename);
        $tmpFinalPath = $finalPath.'.tmp';

        if ($this->filesystem->exists($tmpFinalPath)) {
            $this->filesystem->remove($tmpFinalPath);
        }

        $out = fopen($tmpFinalPath, 'wb');
        if (false === $out) {
            throw new FileUploaderException('Merging files failed.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        try {
            foreach ($files as $filename) {
                $fullName = "$directory/$filename";

                $in = fopen($fullName, 'rb');
                if (false === $in) {
                    throw new FileUploaderException('Merging files failed.', Response::HTTP_INTERNAL_SERVER_ERROR);
                }

                try {
                    $copied = stream_copy_to_stream($in, $out);
                    if (false === $copied) {
                        throw new FileUploaderException('Merging files failed.', Response::HTTP_INTERNAL_SERVER_ERROR);
                    }
                } finally {
                    fclose($in);
                }
            }
        } finally {
            fclose($out);
        }

        if ($this->filesystem->exists($finalPath)) {
            $this->filesystem->remove($finalPath);
        }

        $this->filesystem->rename($tmpFinalPath, $finalPath);

        foreach ($files as $filename) {
            $this->filesystem->remove("$directory/$filename");
        }

        return $finalPath;
    }

    /** @param string[] $files @return string[] */
    private function sortFiles(array $files): array
    {
        usort($files, function (string $filename1, string $filename2): int {
            $index1 = $this->indexParser->parseIndex($filename1);
            $index2 = $this->indexParser->parseIndex($filename2);

            return $index1 <=> $index2;
        });

        return $files;
    }
}
