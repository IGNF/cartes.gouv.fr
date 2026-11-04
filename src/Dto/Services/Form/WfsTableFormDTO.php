<?php

namespace App\Dto\Services\Form;

use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;

class WfsTableFormDTO
{
    #[Assert\NotBlank(message: 'Le nom de la table est obligatoire')]
    #[SerializedName('native_name')]
    public string $native_name = '';

    #[Assert\NotBlank(message: 'Le titre de la table est obligatoire')]
    public string $title = '';

    #[Assert\NotBlank(message: 'Le nom technique de la table est obligatoire')]
    #[Assert\Regex(pattern: '/^[a-z_][a-z0-9_.-]*$/', message: 'Le nom technique de la table ne doit contenir que des minuscules, chiffres, tirets, points et tirets bas')]
    #[SerializedName('public_name')]
    public string $public_name = '';

    #[Assert\NotBlank(message: 'Le résumé de la table est obligatoire')]
    public string $description = '';

    /** @var string[] */
    public array $keywords = [];
}
