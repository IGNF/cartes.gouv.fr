<?php

namespace App\Services\FileUploader\Format;

use App\Services\FileUploader\Exception\FileUploaderException;
use Symfony\Component\DependencyInjection\Attribute\TaggedIterator;
use Symfony\Component\HttpFoundation\Response;

final class FormatHandlerRegistry
{
    /** @var iterable<UploadFormatHandlerInterface> */
    private iterable $handlers;

    /**
     * @param iterable<UploadFormatHandlerInterface> $handlers
     */
    public function __construct(
        #[TaggedIterator('cartesgouvfr.file_uploader.format_handler')] iterable $handlers,
    ) {
        $this->handlers = $handlers;
    }

    public function getForExtension(string $extension): UploadFormatHandlerInterface
    {
        foreach ($this->handlers as $handler) {
            if ($handler->supports($extension)) {
                return $handler;
            }
        }

        throw new FileUploaderException("Format non supporté: $extension", Response::HTTP_BAD_REQUEST);
    }
}
