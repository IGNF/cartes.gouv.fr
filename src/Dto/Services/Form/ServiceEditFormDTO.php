<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\ServiceAccess;
use App\Dto\Upload\UploadAddDTO;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/** Modification d’un flux depuis sa page, validée avec les groupes Default et le type de la configuration. */
class ServiceEditFormDTO
{
    /**
     * @param string[]              $themes
     * @param WfsTableEditFormDTO[] $tables
     * @param string[]              $selected_tables
     */
    public function __construct(
        #[Assert\NotBlank(message: 'Le titre du flux est obligatoire')]
        public readonly string $title = '',

        #[Assert\Count(min: 1, minMessage: 'Sélectionnez au moins une thématique')]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $themes = [],

        public readonly ServiceAccess $access = ServiceAccess::Public,

        #[Assert\Valid]
        public readonly ?ServiceAttributionFormDTO $attribution = null,

        // l’Entrepôt exige `type_infos.abstract` hors WFS
        #[Assert\NotBlank(message: 'La description du flux est obligatoire', groups: [ConfigurationTypes::WMSRASTER, ConfigurationTypes::WMTSTMS, ConfigurationTypes::WMSVECTOR])]
        public readonly string $description = '',

        #[Assert\Valid]
        #[Assert\Count(min: 1, minMessage: 'Veuillez choisir au moins une table', groups: [ConfigurationTypes::WFS])]
        public readonly array $tables = [],

        // tables WMS vecteur cochées, un fichier de style chacune
        #[Assert\Count(min: 1, max: ServiceFormDTO::TABLES_MAX, minMessage: 'Veuillez choisir au moins une table', maxMessage: 'Choisissez au plus {{ limit }} tables', groups: [ConfigurationTypes::WMSVECTOR])]
        #[Assert\Unique(groups: [ConfigurationTypes::WMSVECTOR])]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()], groups: [ConfigurationTypes::WMSVECTOR])]
        public readonly array $selected_tables = [],

        public readonly bool $remove_thumbnail = false,

        public readonly bool $remove_attribution_logo = false,
    ) {
    }

    // les thématiques jointes doivent tenir dans une valeur de tag Entrepôt
    #[Assert\Callback]
    public function validateThemesTagLength(ExecutionContextInterface $context): void
    {
        if (mb_strlen(implode(', ', $this->themes)) > UploadAddDTO::TAG_VALUE_MAX_LENGTH) {
            $context->buildViolation(sprintf('Retirez des thématiques : la sélection dépasse la limite de %d caractères', UploadAddDTO::TAG_VALUE_MAX_LENGTH))
                ->atPath('themes')
                ->addViolation();
        }
    }
}
