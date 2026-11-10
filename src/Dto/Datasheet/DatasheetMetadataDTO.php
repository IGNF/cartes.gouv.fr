<?php

declare(strict_types=1);

namespace App\Dto\Datasheet;

use App\Dto\Metadata\CswLanguage;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Métadonnées d’une fiche de données ; les noms de propriétés sont ceux des champs du formulaire.
 */
#[Assert\Cascade]
class DatasheetMetadataDTO
{
    /** @var string[] */
    public const UPDATE_FREQUENCIES = [
        'continual', 'daily', 'weekly', 'fortnightly', 'monthly', 'quarterly',
        'biannually', 'annually', 'asNeeded', 'irregular', 'notPlanned', 'unknown',
    ];

    /** @var int[] dénominateurs d’échelle proposés par le formulaire (assets/data/md_resolutions.json) */
    public const SCALES = [100, 200, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 5000000, 10000000];

    /** @var string[] */
    public const HIERARCHY_LEVELS = ['dataset', 'series'];

    /**
     * @param string[]               $themes
     * @param string[]               $keywords_inspire
     * @param string[]               $keywords_additional
     * @param ProducerDTO[]          $producers
     * @param TerritoryDTO[]         $territories
     * @param ResourceConditionDTO[] $resource_constraints
     */
    public function __construct(
        // Section description
        #[Assert\NotBlank(message: 'Le nom de la fiche de données est obligatoire')]
        #[Assert\Length(max: 99, maxMessage: 'Le nom ne peut pas dépasser 99 caractères')]
        #[Assert\Regex(
            pattern: '/^[\wÀ-ÿ\-._~!$&\'()*+,;:@%\s]+$/u',
            message: 'Le nom contient des caractères non autorisés'
        )]
        public readonly string $name = '',

        #[Assert\NotBlank(message: 'La description est obligatoire')]
        public readonly string $description = '',

        #[Assert\Count(min: 1, minMessage: 'Sélectionnez au moins une thématique')]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $themes = [],

        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $keywords_inspire = [],

        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $keywords_additional = [],

        #[Assert\NotBlank(message: 'L’identifiant de fichier est obligatoire')]
        #[Assert\Regex(
            pattern: '/^[\w\-.]+$/',
            message: 'L’identifiant de fichier contient des caractères non autorisés'
        )]
        public readonly string $file_identifier = '',

        // Section producteur
        #[Assert\Valid]
        #[Assert\Count(min: 1, minMessage: 'Au moins un producteur est requis')]
        public readonly array $producers = [],

        // Section date
        #[Assert\NotBlank(message: 'La date de création est obligatoire')]
        #[Assert\Date(message: 'La date de création {{ value }} n’est pas une date valide (YYYY-MM-DD)')]
        public readonly string $date_creation = '',

        #[Assert\NotBlank(message: 'La fréquence de mise à jour est obligatoire')]
        #[Assert\Choice(choices: self::UPDATE_FREQUENCIES, message: 'La fréquence de mise à jour est invalide')]
        public readonly string $update_frequency = '',

        // Section emprise spatiale
        #[Assert\Valid]
        #[Assert\Count(min: 1, minMessage: 'Sélectionnez au moins un territoire')]
        public readonly array $territories = [],

        #[Assert\NotNull(message: 'L’échelle est obligatoire')]
        #[Assert\Choice(choices: self::SCALES, message: 'L’échelle est invalide')]
        public readonly ?int $scale = null,

        #[Assert\Positive(message: 'La résolution doit être un nombre positif')]
        public readonly ?float $resolution = null,

        // Section licences
        #[Assert\Valid]
        #[Assert\Count(min: 1, minMessage: 'Ajoutez au moins une condition de licence')]
        public readonly array $resource_constraints = [],

        // Section informations sur les métadonnées
        public readonly ?string $resource_genealogy = null,

        #[Assert\NotBlank(message: 'Le type de données est obligatoire')]
        #[Assert\Choice(choices: self::HIERARCHY_LEVELS, message: 'Le type de données est invalide')]
        public readonly string $hierarchy_level = '',

        #[Assert\NotNull(message: 'La langue est obligatoire')]
        #[Assert\Valid]
        public readonly ?CswLanguage $language = null,

        #[Assert\NotBlank(message: 'Le jeu de caractères est obligatoire')]
        public readonly string $charset = '',
    ) {
    }

    // le premier producteur est le point de contact, verrouillé dans le formulaire
    #[Assert\Callback]
    public function validateFirstProducerRole(ExecutionContextInterface $context): void
    {
        if ([] === $this->producers) {
            return;
        }

        $first = $this->producers[0] ?? null;
        if (!($first instanceof ProducerDTO) || 'pointOfContact' !== $first->role) {
            $context->buildViolation('Le premier producteur doit avoir le rôle "pointOfContact"')
                ->atPath('producers[0].role')
                ->addViolation();
        }
    }

    // un rôle ne peut être attribué qu’à un seul producteur
    #[Assert\Callback]
    public function validateUniqueRoles(ExecutionContextInterface $context): void
    {
        $roles = array_map(
            static fn (ProducerDTO $p) => $p->role,
            $this->producers
        );

        if (count($roles) !== count(array_unique($roles))) {
            $context->buildViolation('Chaque rôle ne peut être attribué qu’à un seul producteur')
                ->atPath('producers')
                ->addViolation();
        }
    }
}
