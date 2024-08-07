<?php

namespace App\Entity\CswMetadata;

class CswDocument
{
    public function __construct(
        public string $name,
        public ?string $description,
        public string $url,
    ) {
    }
}
