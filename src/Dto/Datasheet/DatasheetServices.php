<?php

namespace App\Dto\Datasheet;

use App\Constants\EntrepotApi\ConfigurationStatuses;

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
     * @return array<array<mixed>>
     */
    public function configurations(): array
    {
        return array_values($this->configurationsById);
    }

    /**
     * @return array<array<mixed>>
     */
    public function configurationsOfType(string ...$types): array
    {
        return array_values(array_filter($this->configurationsById, fn (array $configuration) => in_array($configuration['type'], $types, true)));
    }

    /**
     * @return array<array<mixed>>
     */
    public function publishedConfigurations(): array
    {
        return array_values(array_filter($this->configurationsById, fn (array $configuration) => ConfigurationStatuses::PUBLISHED === $configuration['status']));
    }

    /**
     * @return array<mixed>|null
     */
    public function offeringOfConfiguration(string $configurationId): ?array
    {
        foreach ($this->offeringsById as $offering) {
            if (($offering['configuration']['_id'] ?? null) === $configurationId) {
                return $offering;
            }
        }

        return null;
    }

    /**
     * @return array<mixed>|null
     */
    public function configurationOfOffering(string $offeringId): ?array
    {
        $configurationId = $this->offeringsById[$offeringId]['configuration']['_id'] ?? null;

        return null === $configurationId ? null : ($this->configurationsById[$configurationId] ?? null);
    }
}
