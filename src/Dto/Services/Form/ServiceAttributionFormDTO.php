<?php

namespace App\Dto\Services\Form;

use Symfony\Component\Validator\Constraints as Assert;

/** Attribution d’un flux : l’API Entrepôt exige le titre et l’URL ensemble, le logo (fichier séparé) est optionnel. */
class ServiceAttributionFormDTO
{
    #[Assert\NotBlank(message: 'Le texte de l’attribution est obligatoire')]
    public string $title = '';

    #[Assert\NotBlank(message: 'L’URL de l’attribution est obligatoire')]
    #[Assert\Url(message: 'L’URL de l’attribution n’est pas valide')]
    public string $url = '';
}
