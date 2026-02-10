<?php

namespace App\Services\FileUploader\Chunk;

use App\Services\FileUploader\Exception\FileUploaderException;
use Symfony\Component\HttpFoundation\Response;

final class ChunkFilenameIndexParser
{
    public function parseIndex(string $filename): int
    {
        if (!preg_match('/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}_(\d+)/', $filename, $matches)) {
            throw new FileUploaderException('Filename has no index', Response::HTTP_BAD_REQUEST);
        }

        return intval($matches[1]);
    }
}
