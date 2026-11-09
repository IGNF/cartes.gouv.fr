<?php

namespace App\Dto\Datasheet;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Sous-contrainte d’utilisation (section licences) ; les champs obligatoires dépendent du type.
 */
class SubConstraintDTO
{
    /** @var string[] */
    public const TYPES = ['useConstraints', 'accessConstraints', 'useLimitation', 'classification', 'otherConstraints'];

    /** @var string[] */
    public const RESTRICTION_CODES = ['copyright', 'patent', 'patentPending', 'trademark', 'license', 'intellectualPropertyRights', 'restricted', 'otherRestrictions'];

    /** @var string[] */
    public const PUBLIC_ACCESS_LIMITATIONS = [
        'noLimitations',
        'conditionsUnknown',
        'INSPIRE_Directive_Article13_1a',
        'INSPIRE_Directive_Article13_1b',
        'INSPIRE_Directive_Article13_1c',
        'INSPIRE_Directive_Article13_1d',
        'INSPIRE_Directive_Article13_1e',
        'INSPIRE_Directive_Article13_1f',
        'INSPIRE_Directive_Article13_1g',
        'INSPIRE_Directive_Article13_1h',
    ];

    /** @var string[] */
    public const CLASSIFICATION_CODES = ['unclassified', 'restricted', 'confidential', 'secret', 'topSecret'];

    public function __construct(
        #[Assert\NotBlank(message: 'Le type de contrainte est obligatoire')]
        #[Assert\Choice(choices: self::TYPES, message: 'Le type de contrainte est invalide')]
        public readonly string $type = '',

        public readonly bool $locked = false,

        public readonly ?string $restriction_code = null,

        public readonly ?string $limitation_code = null,

        public readonly ?string $classification_code = null,

        public readonly ?string $url = null,
        public readonly ?string $description = null,
    ) {
    }

    // champs obligatoires selon le type de contrainte
    #[Assert\Callback]
    public function validateConditionalFields(ExecutionContextInterface $context): void
    {
        if ('useConstraints' === $this->type || 'accessConstraints' === $this->type) {
            if (empty($this->restriction_code)) {
                $context->buildViolation('La valeur de la contrainte est obligatoire')
                    ->atPath('restriction_code')
                    ->addViolation();
            } elseif (!in_array($this->restriction_code, self::RESTRICTION_CODES, true)) {
                $context->buildViolation('La valeur de la contrainte est invalide')
                    ->atPath('restriction_code')
                    ->addViolation();
            }
        }

        if ('otherConstraints' === $this->type) {
            if (empty($this->limitation_code)) {
                $context->buildViolation('La limitation d’accès est obligatoire')
                    ->atPath('limitation_code')
                    ->addViolation();
            } elseif (!in_array($this->limitation_code, self::PUBLIC_ACCESS_LIMITATIONS, true)) {
                $context->buildViolation('La limitation d’accès est invalide')
                    ->atPath('limitation_code')
                    ->addViolation();
            }
        }

        if ('classification' === $this->type) {
            if (empty($this->classification_code)) {
                $context->buildViolation('La classification est obligatoire')
                    ->atPath('classification_code')
                    ->addViolation();
            } elseif (!in_array($this->classification_code, self::CLASSIFICATION_CODES, true)) {
                $context->buildViolation('La classification est invalide')
                    ->atPath('classification_code')
                    ->addViolation();
            }
        }

        if ('useLimitation' === $this->type) {
            if (empty($this->description)) {
                $context->buildViolation('La description est obligatoire')
                    ->atPath('description')
                    ->addViolation();
            }

            if (!empty($this->url) && false === filter_var($this->url, FILTER_VALIDATE_URL)) {
                $context->buildViolation('L’URL n’est pas valide')
                    ->atPath('url')
                    ->addViolation();
            }
        }
    }
}
