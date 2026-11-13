<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use App\Constants\ServiceAccess;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Formulaire de publication d’un flux depuis une pyramide : WMS raster et WMTS (raster), TMS (vecteur). La vignette et le logo d’attribution voyagent dans la même requête multipart, hors de ce DTO.
 */
class PyramidServiceFormDTO extends ServiceFormDTO
{
    /**
     * @param string[] $themes
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
    ) {
        parent::__construct($title, $technical_name, $themes, $access, $attribution);
    }
}
