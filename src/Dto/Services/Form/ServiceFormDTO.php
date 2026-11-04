<?php

namespace App\Dto\Services\Form;

use App\Constants\ServiceAccess;
use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Champs communs du formulaire de publication d’un flux (création et modification).
 * La vignette et le logo d’attribution voyagent dans la même requête multipart, hors de ce DTO.
 */
class ServiceFormDTO
{
    #[Assert\NotBlank(message: 'Le titre du flux est obligatoire')]
    public string $title = '';

    #[Assert\NotBlank(message: 'Le nom technique du flux est obligatoire')]
    #[Assert\Regex(pattern: '/^[A-Za-z_][A-Za-z0-9_.-]*$/', message: 'Le nom technique ne doit contenir ni espace ni caractère spécial')]
    #[SerializedName('technical_name')]
    public string $technical_name = '';

    /** @var string[] */
    #[Assert\Count(min: 1, minMessage: 'Sélectionnez au moins une thématique')]
    public array $themes = [];

    #[Assert\Choice(choices: ServiceAccess::ALL, message: 'Le type d’accès est invalide')]
    public string $access = ServiceAccess::PUBLIC;

    #[Assert\Valid]
    public ?ServiceAttributionFormDTO $attribution = null;
}
