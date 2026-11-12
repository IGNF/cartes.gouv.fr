<?php

declare(strict_types=1);

namespace App\Dto\Services\PyramidRaster;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class PyramidRasterGenerateDTO
{
    public function __construct(
        #[Assert\NotBlank(message: 'Le nom technique de la pyramide est obligatoire')]
        public string $technical_name,

        #[Assert\Uuid(message: 'L’identifiant du flux WMS-Vecteur est invalide')]
        public string $wmsv_offering_id,

        /** WKT de l’emprise à moissonner */
        #[Assert\NotBlank(message: 'L’emprise de la pyramide est obligatoire')]
        public string $wmsv_config_bbox,

        /** @var int[] niveaux de zoom extrêmes, dans un ordre quelconque */
        #[Assert\Count(exactly: 2, exactMessage: 'Les bornes de la pyramide sont obligatoires')]
        #[Assert\All([new Assert\Type('int')])]
        public array $zoom_range,

        public bool $email_notification = false,
    ) {
    }
}
