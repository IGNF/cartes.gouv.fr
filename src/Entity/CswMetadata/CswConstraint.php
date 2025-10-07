<?php

namespace App\Entity\CswMetadata;

class CswConstraint
{
    public function __construct(
        public ?string $code = null,
        public ?string $name = null,
        public ?string $link = null,
    ) {
    }
}
