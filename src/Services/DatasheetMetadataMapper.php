<?php

declare(strict_types=1);

namespace App\Services;

use App\Dto\Datasheet\DatasheetMetadataDTO;
use App\Dto\Metadata\CswHierarchyLevel;
use App\Dto\Metadata\CswLanguage;
use App\Dto\Metadata\CswMetadata;
use Psr\Clock\ClockInterface;

/**
 * Seul rédacteur des champs saisis de la fiche de métadonnées : le formulaire remplace ces champs, le serveur garde ce qu’il dérive.
 */
class DatasheetMetadataMapper
{
    public function __construct(private readonly ClockInterface $clock)
    {
    }

    // ressources en ligne, vignette, identifiant et date de publication viennent de la fiche existante
    public function map(DatasheetMetadataDTO $dto, ?CswMetadata $existing = null): CswMetadata
    {
        $metadata = $existing instanceof CswMetadata ? clone $existing : new CswMetadata();

        $metadata->file_identifier = $existing->file_identifier ?? $dto->file_identifier;
        $metadata->hierarchy_level = CswHierarchyLevel::from($dto->hierarchy_level);
        $metadata->language = $dto->language instanceof CswLanguage ? clone $dto->language : CswLanguage::default();
        $metadata->charset = $dto->charset;
        $metadata->name = $dto->name;
        $metadata->description = $dto->description;
        $metadata->date_creation = $dto->date_creation;
        $metadata->date_revision = $existing instanceof CswMetadata ? $this->clock->now()->format('Y-m-d') : null;
        $metadata->resource_genealogy = $dto->resource_genealogy;
        $metadata->keywords_inspire = array_values($dto->keywords_inspire);
        $metadata->keywords_additional = array_values($dto->keywords_additional);
        $metadata->themes = array_values($dto->themes);
        $metadata->producers = array_values($dto->producers);
        $metadata->territories = array_values($dto->territories);
        $metadata->resource_constraints = array_values($dto->resource_constraints);
        $metadata->scale = $dto->scale;
        $metadata->resolution = $dto->resolution;
        $metadata->update_frequency = $dto->update_frequency;

        return $metadata;
    }
}
