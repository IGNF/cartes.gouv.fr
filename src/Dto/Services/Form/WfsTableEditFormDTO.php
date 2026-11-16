<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Table d’un flux WFS modifié : `public_name` facultatif (vide = l’Entrepôt sert `native_name`) ;
 * sa forme est contrôlée par ServiceController, qui accepte le nom déjà enregistré des anciens flux.
 */
class WfsTableEditFormDTO
{
    /**
     * @param string[] $keywords
     */
    public function __construct(
        #[Assert\NotBlank(message: 'Le nom de la table est obligatoire')]
        public readonly string $native_name = '',

        #[Assert\NotBlank(message: 'Le titre de la table est obligatoire')]
        public readonly string $title = '',

        public readonly string $public_name = '',

        #[Assert\NotBlank(message: 'Le résumé de la table est obligatoire')]
        public readonly string $description = '',

        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $keywords = [],
    ) {
    }
}
