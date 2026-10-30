<?php

namespace App\Services\FileUploader\Format;

use App\Services\FileUploader\Exception\FileUploaderException;
use Symfony\Component\DependencyInjection\Attribute\AutowireIterator;
use Symfony\Component\HttpFoundation\Response;

final readonly class FormatHandlerRegistry
{
    /**
     * @param iterable<UploadFormatHandlerInterface> $handlers
     */
    public function __construct(
        #[AutowireIterator('cartesgouvfr.file_uploader.format_handler')] private iterable $handlers,
    ) {
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
