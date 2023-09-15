<?php

namespace App\Services;

use Twig\Environment as Twig;

class MetadataBuilder
{
    public function __construct(private Twig $twig)
    {
    }

    /**
     * @param array<string,mixed> $args
     */
    public function build(array $args): string
    {
        $content = $this->twig->render('metadata/metadata_dataset_iso.xml.twig', [
            ...$args,
        ]);

        return $content;
    }
}
