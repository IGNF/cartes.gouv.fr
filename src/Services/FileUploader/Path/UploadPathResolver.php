<?php

namespace App\Services\FileUploader\Path;

use App\Services\FileUploader\Exception\FileUploaderException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Uid\UuidV4;

final class UploadPathResolver
{
    public function __construct(private readonly ParameterBagInterface $parameterBag)
    {
    }

    public function getUploadRoot(): string
    {
        return $this->parameterBag->get('upload_path');
    }

    public function getUploadDirectory(string $uuid): string
    {
        $uuid = $this->assertValidUuid($uuid);

        return rtrim($this->getUploadRoot(), '/')."/$uuid";
    }

    public function getFinalPath(string $uuid, string $originalFilename): string
    {
        $filename = $this->sanitizeFilename($originalFilename);

        return $this->getUploadDirectory($uuid).'/'.$filename;
    }

    public function toRelativeUploadPath(string $uuid, string $filename): string
    {
        $uuid = $this->assertValidUuid($uuid);

        $filename = $this->sanitizeFilename($filename);

        return "$uuid/$filename";
    }

    public function sanitizeFilename(string $originalFilename): string
    {
        $originalFilename = trim($originalFilename);
        if ('' === $originalFilename) {
            throw new FileUploaderException('Le paramètre [originalFilename] est invalide', Response::HTTP_BAD_REQUEST);
        }

        if (str_contains($originalFilename, "\0") || str_contains($originalFilename, '/') || str_contains($originalFilename, '\\')) {
            throw new FileUploaderException('Le paramètre [originalFilename] est invalide', Response::HTTP_BAD_REQUEST);
        }

        $basename = basename($originalFilename);
        if ($basename !== $originalFilename) {
            throw new FileUploaderException('Le paramètre [originalFilename] est invalide', Response::HTTP_BAD_REQUEST);
        }

        if ('.' === $basename || '..' === $basename) {
            throw new FileUploaderException('Le paramètre [originalFilename] est invalide', Response::HTTP_BAD_REQUEST);
        }

        return $basename;
    }

    private function assertValidUuid(string $uuid): string
    {
        $uuid = trim($uuid);
        if ('' === $uuid || !UuidV4::isValid($uuid)) {
            throw new FileUploaderException('Le paramètre [uuid] est invalide', Response::HTTP_BAD_REQUEST);
        }

        return $uuid;
    }
}
