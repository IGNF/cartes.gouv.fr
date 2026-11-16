<?php

declare(strict_types=1);

namespace App\Dto\Datasheet;

use App\Utils;

/**
 * Configurations (détaillées) et offerings d'une fiche de données, chargées une fois par traitement et passées explicitement.
 */
final readonly class DatasheetServices
{
    /**
     * @param array<string,array<mixed>> $configurationsById configuration détaillée par id
     * @param array<string,array<mixed>> $offeringsById      offering détaillée par id
     */
    public function __construct(
        public array $configurationsById,
        public array $offeringsById,
    ) {
    }

    /**
     * @return array<mixed>|null
     */
    public function offering(string $offeringId): ?array
    {
        return $this->offeringsById[$offeringId] ?? null;
    }

    /**
     * @return array<mixed>|null
     */
    public function offeringOfConfiguration(string $configurationId): ?array
    {
        return Utils::array_find($this->offeringsById, fn (array $offering) => ($offering['configuration']['_id'] ?? null) === $configurationId);
    }

    /**
     * Configurations de la fiche qui n’ont aucune offre, quel que soit leur statut.
     *
     * @return list<array<mixed>>
     */
    public function configurationsWithoutOffering(): array
    {
        $configurationIds = array_flip(array_map(fn (array $offering) => $offering['configuration']['_id'] ?? null, $this->offeringsById));

        return array_values(array_filter($this->configurationsById, fn (array $configuration) => !isset($configurationIds[$configuration['_id']])));
    }

    /**
     * @return array<mixed>|null
     */
    public function configurationOfOffering(string $offeringId): ?array
    {
        $configurationId = $this->offering($offeringId)['configuration']['_id'] ?? null;

        return null === $configurationId ? null : ($this->configurationsById[$configurationId] ?? null);
    }
}
