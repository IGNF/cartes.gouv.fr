<?php

namespace App\Entity\CswMetadata;

class CswLanguage
{
    public function __construct(
        public string $code,
        public string $language,
    ) {
        $this->code = trim($code);
        $this->language = trim($language);
    }

    public static function default(): self
    {
        return new self('fre', 'français');
    }
}
