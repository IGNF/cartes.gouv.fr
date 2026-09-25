<?php

namespace App\Dto\Datasheet;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Un territoire de l'emprise spatiale (section emprise du formulaire).
 * La bbox est envoyée par le front (déjà présente dans Territories.json) pour éviter un re-téléchargement côté serveur.
 */
class TerritoryDTO
{
    /**
     * @param float[] $bbox [minLon, minLat, maxLon, maxLat]
     */
    public function __construct(
        #[Assert\NotBlank(message: "L'identifiant du territoire est obligatoire")]
        public readonly string $id = '',

        #[Assert\NotBlank(message: 'Le libellé du territoire est obligatoire')]
        public readonly string $title = '',

        #[Assert\Count(exactly: 4, exactMessage: 'La bbox doit contenir exactement 4 coordonnées')]
        public readonly array $bbox = [],
    ) {
    }
}
