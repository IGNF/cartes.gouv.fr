<?php

declare(strict_types=1);

namespace App\Dto\Metadata;

use Symfony\Component\Validator\Constraints as Assert;

class CswLanguage
{
    public function __construct(
        #[Assert\NotBlank(message: 'La langue est obligatoire')]
        public string $code,
        #[Assert\NotBlank(message: 'Le libellé de langue est obligatoire')]
        public string $language,
    ) {
        $this->code = strtolower(trim($code));
        $this->language = strtolower(trim($language));
    }

    public static function default(): self
    {
        return new self('fre', 'français');
    }
}
