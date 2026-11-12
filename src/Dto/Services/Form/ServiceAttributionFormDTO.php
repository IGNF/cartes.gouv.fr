<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use Symfony\Component\Validator\Constraints as Assert;

/** L’Entrepôt exige le titre et l’URL ensemble ; le logo voyage comme fichier séparé. */
class ServiceAttributionFormDTO
{
    public function __construct(
        #[Assert\NotBlank(message: 'Le texte de l’attribution est obligatoire')]
        public readonly string $title = '',

        #[Assert\NotBlank(message: 'L’URL de l’attribution est obligatoire')]
        #[Assert\Url(message: 'L’URL de l’attribution n’est pas valide', requireTld: true)]
        public readonly string $url = '',
    ) {
    }
}
