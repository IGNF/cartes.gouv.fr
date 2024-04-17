<?php

namespace App\Entity\CswMetadata;

class CswLanguage
{
    public function __construct(
        public string $code,
        public string $language,
    ) {
    }

    public static function default(): self
    {
        return new self('fra', 'français');
    }
}
