<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\ServiceAccess;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Publication d’un flux, validée avec les groupes Default et le type de configuration. La vignette, le logo d’attribution et les fichiers SLD voyagent dans la même requête multipart, hors de ce DTO.
 */
class ServicePublishFormDTO extends ServiceFormDTO
{
    public const TYPES = [ConfigurationTypes::WFS, ConfigurationTypes::WMSVECTOR, ConfigurationTypes::WMSRASTER, ConfigurationTypes::WMTSTMS];

    /**
     * @param string[]          $themes
     * @param WfsTableFormDTO[] $tables
     * @param string[]          $selected_tables
     */
    public function __construct(
        string $title = '',
        array $themes = [],
        ServiceAccess $access = ServiceAccess::Public,
        ?ServiceAttributionFormDTO $attribution = null,

        #[Assert\Choice(choices: self::TYPES, message: 'Le type de flux est inconnu')]
        public readonly string $type = '',

        // inséré dans le chemin des requêtes Entrepôt
        #[Assert\NotBlank(message: 'Choisissez un jeu de données')]
        #[Assert\Regex(pattern: '/^[\w-]+\z/', message: 'L’identifiant du jeu de données est invalide')]
        public readonly string $stored_data_id = '',

        #[Assert\NotBlank(message: 'Le nom technique du flux est obligatoire')]
        #[Assert\Regex(pattern: '/^[A-Za-z_][A-Za-z0-9_.-]*\z/', message: 'Le nom technique ne doit contenir ni espace ni caractère spécial')]
        public readonly string $technical_name = '',

        // l’Entrepôt exige `type_infos.abstract` hors WFS
        #[Assert\NotBlank(message: 'La description du flux est obligatoire', groups: [ConfigurationTypes::WMSRASTER, ConfigurationTypes::WMTSTMS, ConfigurationTypes::WMSVECTOR])]
        public readonly string $description = '',

        #[Assert\Valid]
        #[Assert\Count(min: 1, max: self::TABLES_MAX, minMessage: 'Veuillez choisir au moins une table', maxMessage: 'Choisissez au plus {{ limit }} tables', groups: [ConfigurationTypes::WFS])]
        public readonly array $tables = [],

        // tables WMS vecteur cochées, un fichier de style chacune
        #[Assert\Count(min: 1, max: self::TABLES_MAX, minMessage: 'Veuillez choisir au moins une table', maxMessage: 'Choisissez au plus {{ limit }} tables', groups: [ConfigurationTypes::WMSVECTOR])]
        #[Assert\Unique(groups: [ConfigurationTypes::WMSVECTOR])]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()], groups: [ConfigurationTypes::WMSVECTOR])]
        public readonly array $selected_tables = [],

        // WMS vecteur ; null : infobulles désactivées
        #[Assert\Valid]
        public readonly ?FeatureInfoFormDTO $featureinfo = null,
    ) {
        parent::__construct($title, $themes, $access, $attribution);
    }

    #[Assert\Callback(groups: [ConfigurationTypes::WMSVECTOR])]
    public function validateFeatureInfoTables(ExecutionContextInterface $context): void
    {
        $this->featureinfo?->validateTables($this->selected_tables, $context);
    }
}
