<?php

namespace App\Dto\Datasheet;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Territoire de l’emprise spatiale ; le front envoie la bbox pour éviter un appel au géocodage côté serveur.
 */
class TerritoryDTO
{
    /**
     * @param float[] $bbox [minLon, minLat, maxLon, maxLat]
     */
    public function __construct(
        #[Assert\NotBlank(message: 'L’identifiant du territoire est obligatoire')]
        public readonly string $id = '',

        #[Assert\NotBlank(message: 'Le libellé du territoire est obligatoire')]
        public readonly string $title = '',

        #[Assert\Count(exactly: 4, exactMessage: 'La bbox doit contenir exactement 4 coordonnées')]
        #[Assert\All([new Assert\Type('numeric')])]
        public readonly array $bbox = [],
    ) {
    }
}
