<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\ServiceAccess;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/** Modification d’un flux depuis sa page, validée avec les groupes Default et le type de la configuration. */
class ServiceEditFormDTO extends ServiceFormDTO
{
    /**
     * @param string[]              $themes
     * @param WfsTableEditFormDTO[] $tables
     * @param string[]              $selected_tables
     */
    public function __construct(
        string $title = '',
        array $themes = [],
        ServiceAccess $access = ServiceAccess::Public,
        ?ServiceAttributionFormDTO $attribution = null,

        // l’Entrepôt exige `type_infos.abstract` hors WFS
        #[Assert\NotBlank(message: 'La description du flux est obligatoire', groups: [ConfigurationTypes::WMSRASTER, ConfigurationTypes::WMTSTMS, ConfigurationTypes::WMSVECTOR])]
        public readonly string $description = '',

        // sans plafond de tables : d’anciens flux WFS en ont plus de TABLES_MAX et restent modifiables
        #[Assert\Valid]
        #[Assert\Count(min: 1, minMessage: 'Veuillez choisir au moins une table', groups: [ConfigurationTypes::WFS])]
        public readonly array $tables = [],

        // tables WMS vecteur cochées, un fichier de style chacune
        #[Assert\Count(min: 1, max: self::TABLES_MAX, minMessage: 'Veuillez choisir au moins une table', maxMessage: 'Choisissez au plus {{ limit }} tables', groups: [ConfigurationTypes::WMSVECTOR])]
        #[Assert\Unique(groups: [ConfigurationTypes::WMSVECTOR])]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()], groups: [ConfigurationTypes::WMSVECTOR])]
        public readonly array $selected_tables = [],

        public readonly bool $remove_thumbnail = false,

        public readonly bool $remove_attribution_logo = false,

        // WMS vecteur ; null : infobulles désactivées (les modèles personnalisés restent)
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
