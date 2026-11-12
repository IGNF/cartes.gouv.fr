<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use App\Constants\ServiceAccess;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Formulaire de publication d’un flux WMS vecteur. Les fichiers SLD (`style_files[<table>]`), la vignette et le logo d’attribution voyagent dans la même requête multipart, hors de ce DTO.
 */
class WmsVectorFormDTO extends ServiceFormDTO
{
    public const DESCRIPTION_MAX_LENGTH = 300;

    /**
     * @param string[] $themes
     * @param string[] $selected_tables
     */
    public function __construct(
        string $title = '',
        string $technical_name = '',
        array $themes = [],
        ServiceAccess $access = ServiceAccess::Public,
        ?ServiceAttributionFormDTO $attribution = null,

        // l’Entrepôt exige `type_infos.abstract`
        #[Assert\NotBlank(message: 'La description du flux est obligatoire')]
        #[Assert\Length(max: self::DESCRIPTION_MAX_LENGTH, maxMessage: 'La description du flux ne peut pas dépasser {{ limit }} caractères')]
        public readonly string $description = '',

        #[Assert\Count(min: 1, max: self::TABLES_MAX, minMessage: 'Veuillez choisir au moins une table', maxMessage: 'Choisissez au plus {{ limit }} tables')]
        #[Assert\Unique]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $selected_tables = [],
    ) {
        parent::__construct($title, $technical_name, $themes, $access, $attribution);
    }
}
