<?php

namespace App\Dto\Datasheet;

use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * DTO de validation pour la fiche de données (nouveau formulaire Figma 2026).
 * Les noms de propriétés correspondent exactement aux champs du formulaire React.
 */
#[Assert\Cascade]
class DatasheetMetadataDTO
{
    // NOTE : « quaterly » est la graphie historique du vocabulaire frequency_code (cf. maintenance_frequency.json
    // et l'API Entrepôt). Ne pas corriger ici sans corriger simultanément le fichier JSON et le mapping API.
    /** @var string[] */
    public const UPDATE_FREQUENCIES = [
        'continual', 'daily', 'weekly', 'fortnightly', 'monthly', 'quaterly',
        'biannually', 'annually', 'asNeeded', 'irregular', 'notPlanned', 'unknown',
    ];

    /** @var string[] */
    public const HIERARCHY_LEVELS = ['dataset', 'series'];

    /**
     * @param string[]               $themes
     * @param string[]               $keywords_inspire
     * @param string[]               $keywords_additional
     * @param ProducerDTO[]          $producers
     * @param array<array<mixed>>    $territories
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
        public readonly array $themes = [],

        #[SerializedName('keywords_inspire')]
        public readonly array $keywords_inspire = [],

        #[SerializedName('keywords_additional')]
        public readonly array $keywords_additional = [],

        #[SerializedName('file_identifier')]
        #[Assert\NotBlank(message: "L'identifiant de fichier est obligatoire")]
        #[Assert\Regex(
            pattern: '/^[\w\-.]+$/',
            message: "L'identifiant de fichier contient des caractères non autorisés"
        )]
        public readonly string $file_identifier = '',

        // Section producteur
        #[Assert\Valid]
        #[Assert\Count(min: 1, minMessage: 'Au moins un producteur est requis')]
        public readonly array $producers = [],

        // Section date
        #[SerializedName('date_creation')]
        #[Assert\NotBlank(message: 'La date de création est obligatoire')]
        #[Assert\Date(message: 'La date de création {{ value }} n\'est pas une date valide (YYYY-MM-DD)')]
        public readonly string $date_creation = '',

        #[SerializedName('update_frequency')]
        #[Assert\NotBlank(message: 'La fréquence de mise à jour est obligatoire')]
        #[Assert\Choice(choices: self::UPDATE_FREQUENCIES, message: 'La fréquence de mise à jour est invalide')]
        public readonly string $update_frequency = '',

        // Section emprise spatiale
        #[Assert\Count(min: 1, minMessage: 'Sélectionnez au moins un territoire')]
        public readonly array $territories = [],

        // Section licences
        #[SerializedName('resource_constraints')]
        #[Assert\Valid]
        #[Assert\Count(min: 1, minMessage: 'Ajoutez au moins une condition de licence')]
        public readonly array $resource_constraints = [],

        // Section informations sur les métadonnées
        #[SerializedName('resource_genealogy')]
        public readonly ?string $resource_genealogy = null,

        #[SerializedName('hierarchy_level')]
        #[Assert\NotBlank(message: 'Le type de données est obligatoire')]
        #[Assert\Choice(choices: self::HIERARCHY_LEVELS, message: 'Le type de données est invalide')]
        public readonly string $hierarchy_level = '',

        #[Assert\NotNull(message: 'La langue est obligatoire')]
        #[Assert\Valid]
        public readonly ?LanguageDTO $language = null,

        #[Assert\NotBlank(message: 'Le jeu de caractères est obligatoire')]
        public readonly string $charset = '',
    ) {
    }

    /**
     * Vérifie que le premier producteur est bien de rôle "pointOfContact"
     * (invariant structurel du formulaire — la 1ère carte est verrouillée côté UI).
     */
    #[Assert\Callback]
    public function validateFirstProducerRole(ExecutionContextInterface $context): void
    {
        if (empty($this->producers)) {
            return;
        }

        $first = $this->producers[0] ?? null;
        if (!($first instanceof ProducerDTO) || 'pointOfContact' !== $first->role) {
            $context->buildViolation('Le premier producteur doit avoir le rôle "contact"')
                ->atPath('producers[0].role')
                ->addViolation();
        }
    }
}
