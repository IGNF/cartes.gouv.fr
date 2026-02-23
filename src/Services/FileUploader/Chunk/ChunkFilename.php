<?php

namespace App\Services\FileUploader\Chunk;

use App\Services\FileUploader\Exception\FileUploaderException;
use Symfony\Component\HttpFoundation\Response;

final class ChunkFilename
{
    public static function build(string $uuid, int $index): string
    {
        return sprintf('%s_%d', $uuid, $index);
    }

    public static function patternForUuid(string $uuid): string
    {
        return '/^'.preg_quote($uuid, '/').'_\d+$/';
    }

    public static function parseIndex(string $filename): int
    {
        if (!preg_match('/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}_(\d+)$/', $filename, $matches)) {
            throw new FileUploaderException('Filename has no index', Response::HTTP_BAD_REQUEST);
        }

        return intval($matches[1]);
    }
}
