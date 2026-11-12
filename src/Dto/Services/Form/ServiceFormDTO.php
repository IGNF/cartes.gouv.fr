<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use App\Constants\ServiceAccess;
use App\Dto\Upload\UploadAddDTO;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/** Champs communs du formulaire de publication d’un flux. */
abstract class ServiceFormDTO
{
    // un fichier de style par table en WMS vecteur : reste sous max_file_uploads de PHP (20)
    public const TABLES_MAX = 10;

    /**
     * @param string[] $themes
     */
    public function __construct(
        #[Assert\NotBlank(message: 'Le titre du flux est obligatoire')]
        public readonly string $title = '',

        #[Assert\NotBlank(message: 'Le nom technique du flux est obligatoire')]
        #[Assert\Regex(pattern: '/^[A-Za-z_][A-Za-z0-9_.-]*$/', message: 'Le nom technique ne doit contenir ni espace ni caractère spécial')]
        public readonly string $technical_name = '',

        #[Assert\Count(min: 1, minMessage: 'Sélectionnez au moins une thématique')]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $themes = [],

        public readonly ServiceAccess $access = ServiceAccess::Public,

        #[Assert\Valid]
        public readonly ?ServiceAttributionFormDTO $attribution = null,
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
