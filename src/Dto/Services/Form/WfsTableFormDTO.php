<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use Symfony\Component\Validator\Constraints as Assert;

class WfsTableFormDTO
{
    /**
     * @param string[] $keywords
     */
    public function __construct(
        #[Assert\NotBlank(message: 'Le nom de la table est obligatoire')]
        public readonly string $native_name = '',

        #[Assert\NotBlank(message: 'Le titre de la table est obligatoire')]
        public readonly string $title = '',

        #[Assert\NotBlank(message: 'Le nom technique de la table est obligatoire')]
        #[Assert\Regex(pattern: '/^[a-z_][a-z0-9_.-]*$/', message: 'Le nom technique de la table ne doit contenir que des minuscules, chiffres, tirets, points et tirets bas')]
        public readonly string $public_name = '',

        #[Assert\NotBlank(message: 'Le résumé de la table est obligatoire')]
        public readonly string $description = '',

        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $keywords = [],
    ) {
    }
}
