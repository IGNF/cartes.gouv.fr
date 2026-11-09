<?php

namespace App\Dto\Upload;

use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Déclaration de livraison (formulaire « Ajouter une donnée ») ; les noms de propriétés sont ceux des champs du formulaire.
 */
class UploadAddDTO
{
    /** Longueur max d'une valeur de tag Entrepôt */
    public const TAG_VALUE_MAX_LENGTH = 99;

    public const DATASET_NAME_MAX_LENGTH = 80;
    public const DATASET_DESCRIPTION_MAX_LENGTH = 250;
    public const PRODUCER_SHORT_MAX_LENGTH = 15;

    /**
     * @param string[] $themes
     */
    public function __construct(
        #[SerializedName('datasheet_name')]
        #[Assert\NotBlank(message: 'Le nom de la fiche de données est obligatoire')]
        #[Assert\Length(max: self::TAG_VALUE_MAX_LENGTH, maxMessage: 'Le nom de la fiche de données ne peut pas dépasser {{ limit }} caractères')]
        #[Assert\Regex(pattern: '/^[\wÀ-ÿ\-._~!$&\'()*+,;:@%\s]+$/u', message: 'Le nom de la fiche de données contient des caractères non autorisés')]
        public readonly string $datasheet_name = '',

        #[SerializedName('data_upload_path')]
        #[Assert\NotBlank(message: 'Veuillez déposer un fichier de données')]
        #[Assert\Regex(pattern: '#^[0-9a-f-]{36}/(?!\.\.?$)[^/\\\\]+$#', message: 'Chemin de fichier invalide')]
        public readonly string $data_upload_path = '',

        #[Assert\NotBlank(message: 'Le nom du jeu de données est obligatoire')]
        #[Assert\Length(max: self::DATASET_NAME_MAX_LENGTH, maxMessage: 'Le nom du jeu de données ne peut pas dépasser {{ limit }} caractères')]
        // même motif que regex.public_name (assets/utils/index.ts) : garder les deux synchronisés
        #[Assert\Regex(pattern: '/^[A-Za-z_][A-Za-z0-9_.-]*$/', message: 'Le nom du jeu de données doit commencer par une lettre ou un underscore et ne contenir que des lettres non accentuées, chiffres, tirets, points ou underscores')]
        public readonly string $name = '',

        #[Assert\NotBlank(message: 'La description est obligatoire')]
        #[Assert\Length(max: self::DATASET_DESCRIPTION_MAX_LENGTH, maxMessage: 'La description ne peut pas dépasser {{ limit }} caractères')]
        public readonly string $description = '',

        #[Assert\NotBlank(message: 'La projection est obligatoire')]
        #[Assert\Regex(pattern: '/^EPSG:\d+$/', message: 'La projection doit être un code EPSG (EPSG:xxxx)')]
        public readonly string $srid = '',

        #[Assert\NotBlank(message: 'Le nom de l’organisme est obligatoire')]
        #[Assert\Length(
            min: 2,
            max: self::TAG_VALUE_MAX_LENGTH,
            minMessage: 'Le nom de l’organisme doit comporter entre {{ min }} et {{ max }} caractères',
            maxMessage: 'Le nom de l’organisme doit comporter entre {{ min }} et {{ max }} caractères',
        )]
        public readonly string $producer = '',

        #[SerializedName('producer_short')]
        #[Assert\Length(max: self::PRODUCER_SHORT_MAX_LENGTH, maxMessage: 'L’acronyme ne peut pas dépasser {{ limit }} caractères')]
        public readonly ?string $producer_short = null,

        #[Assert\Count(min: 1, minMessage: 'Sélectionnez au moins une thématique')]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $themes = [],

        #[SerializedName('production_date')]
        #[Assert\NotBlank(message: 'La date de production est obligatoire')]
        #[Assert\Date(message: 'La date de production {{ value }} n’est pas une date valide (YYYY-MM-DD)')]
        public readonly string $production_date = '',

        #[Assert\NotBlank(message: 'L’étendue spatiale est obligatoire')]
        #[Assert\Length(max: self::TAG_VALUE_MAX_LENGTH, maxMessage: 'L’étendue spatiale ne peut pas dépasser {{ limit }} caractères')]
        public readonly string $zone = '',

        #[SerializedName('email_notification')]
        public readonly bool $email_notification = true,
    ) {
    }

    // dates ISO : la comparaison de chaînes suffit
    #[Assert\Callback]
    public function validateProductionDate(ExecutionContextInterface $context): void
    {
        if ('' !== $this->production_date && $this->production_date > (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d')) {
            $context->buildViolation('La date de production ne peut pas être dans le futur')
                ->atPath('production_date')
                ->addViolation();
        }
    }

    // les thématiques jointes doivent tenir dans une valeur de tag Entrepôt
    #[Assert\Callback]
    public function validateThemesTagLength(ExecutionContextInterface $context): void
    {
        if (mb_strlen(implode(', ', $this->themes)) > self::TAG_VALUE_MAX_LENGTH) {
            $context->buildViolation(sprintf('Retirez des thématiques : la sélection dépasse la limite de %d caractères', self::TAG_VALUE_MAX_LENGTH))
                ->atPath('themes')
                ->addViolation();
        }
    }

    /**
     * Année de production dérivée de la date de production, pour le tag production_year.
     */
    public function getProductionYear(): int
    {
        return (int) substr($this->production_date, 0, 4);
    }
}
