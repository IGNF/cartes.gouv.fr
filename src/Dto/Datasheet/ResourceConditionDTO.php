<?php

namespace App\Dto\Datasheet;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Une condition d'utilisation (encart dans la section licences).
 * Correspond à MD_LegalConstraints / MD_SecurityConstraints / MD_Constraints ISO 19139.
 */
#[Assert\Cascade]
class ResourceConditionDTO
{
    /** @var string[] */
    public const TYPES = ['legal', 'security', 'other'];

    /**
     * @param SubConstraintDTO[] $constraints
     */
    public function __construct(
        #[Assert\NotBlank(message: 'Le type de condition est obligatoire')]
        #[Assert\Choice(choices: self::TYPES, message: 'Le type de condition est invalide')]
        public readonly string $type = '',

        #[Assert\Valid]
        #[Assert\Count(min: 1, minMessage: 'Au moins une contrainte est requise')]
        public readonly array $constraints = [],
    ) {
    }
}
