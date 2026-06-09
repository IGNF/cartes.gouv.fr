<?php

namespace App\Dto\Datasheet;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Langue de la ressource (correspondance { code, language } du formulaire React).
 */
class LanguageDTO
{
    public function __construct(
        #[Assert\NotBlank(message: 'La langue est obligatoire')]
        public readonly string $code = '',

        #[Assert\NotBlank(message: 'Le libellé de langue est obligatoire')]
        public readonly string $language = '',
    ) {
    }
}
