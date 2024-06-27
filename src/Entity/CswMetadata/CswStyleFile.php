<?php

namespace App\Entity\CswMetadata;

class CswStyleFile
{
    public function __construct(
        public string $name,
        public string $description,
        public string $url,
    ) {
    }
}
