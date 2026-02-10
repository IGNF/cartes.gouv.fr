<?php

namespace App\Services\FileUploader\Path;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

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
        return rtrim($this->getUploadRoot(), '/')."/$uuid";
    }

    public function getFinalPath(string $uuid, string $originalFilename): string
    {
        return $this->getUploadDirectory($uuid).'/'.$originalFilename;
    }

    public function toRelativeUploadPath(string $uuid, string $filename): string
    {
        return "$uuid/$filename";
    }
}
