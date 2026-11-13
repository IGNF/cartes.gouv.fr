<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use App\Constants\ServiceAccess;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Formulaire de publication d’un flux WFS. La vignette et le logo d’attribution voyagent dans la même requête multipart, hors de ce DTO.
 */
class WfsFormDTO extends ServiceFormDTO
{
    /**
     * @param string[]          $themes
     * @param WfsTableFormDTO[] $tables
     */
    public function __construct(
        string $title = '',
        string $technical_name = '',
        array $themes = [],
        ServiceAccess $access = ServiceAccess::Public,
        ?ServiceAttributionFormDTO $attribution = null,

        #[Assert\Valid]
        #[Assert\Count(min: 1, max: self::TABLES_MAX, minMessage: 'Veuillez choisir au moins une table', maxMessage: 'Choisissez au plus {{ limit }} tables')]
        public readonly array $tables = [],
    ) {
        parent::__construct($title, $technical_name, $themes, $access, $attribution);
    }
}
