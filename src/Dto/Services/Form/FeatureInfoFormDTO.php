<?php

declare(strict_types=1);

namespace App\Dto\Services\Form;

use App\Services\EntrepotApi\WmsVectorFeatureInfoService;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/** Infobulles d’un flux WMS vecteur ; absent (null) quand elles sont désactivées. */
class FeatureInfoFormDTO
{
    /**
     * @param array<string, list<string>> $attributes attributs affichés par table cochée
     */
    public function __construct(
        #[Assert\Choice(choices: WmsVectorFeatureInfoService::FORMATS, message: 'Le format d’affichage est inconnu')]
        public readonly string $format = WmsVectorFeatureInfoService::FORMAT_LIST,

        #[Assert\All([
            new Assert\Type('array'),
            new Assert\Count(min: 1, minMessage: 'Choisissez au moins un attribut'),
            new Assert\All([new Assert\Type('string'), new Assert\Regex(pattern: WmsVectorFeatureInfoService::NAME_PATTERN, message: 'Ce nom d’attribut n’est pas pris en charge')]),
        ])]
        public readonly array $attributes = [],
    ) {
    }

    /**
     * Une entrée par table cochée, aucune autre.
     *
     * @param array<mixed> $selectedTables
     */
    public function validateTables(array $selectedTables, ExecutionContextInterface $context): void
    {
        $selectedTables = array_map(strval(...), $selectedTables);
        // une clé « 2024 » devient un entier en PHP
        $tables = array_map(strval(...), array_keys($this->attributes));
        foreach (array_diff($selectedTables, $tables) as $table) {
            $context->buildViolation('Choisissez au moins un attribut')->atPath("featureinfo.attributes[$table]")->addViolation();
        }
        foreach (array_diff($tables, $selectedTables) as $table) {
            $context->buildViolation('Cette table n’est pas cochée')->atPath("featureinfo.attributes[$table]")->addViolation();
        }
    }
}
