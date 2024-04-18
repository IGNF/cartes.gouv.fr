<?php

namespace App\Entity\CswMetadata;

/**
 * Classe représentant une métadonnée du catalogue GeoNetwork.
 *
 * @see https://en.wikipedia.org/wiki/GeoNetwork_opensource
 * @see https://en.wikipedia.org/wiki/Catalogue_Service_for_the_Web
 */
class CswMetadata
{
    public string $fileIdentifier;
    public CswHierarchyLevel $hierarchyLevel;
    public CswLanguage $language;
    public string $charset;
    public string $title;
    public string $abstract;
    public string $creationDate;

    /** @var array<string> */
    public array $thematicCategories;
    public string $contactEmail;
    public string $organisationName;
    public string $organisationEmail;

    /** @var array<CswMetadataLayer> */
    public array $layers;

    public static function createEmpty(): self
    {
        $empty = new self();
        $empty->hierarchyLevel = CswHierarchyLevel::Series;
        $empty->language = CswLanguage::default();
        $empty->charset = 'utf8';

        return $empty;
    }

    /**
     * @param array<string>           $thematicCategories
     * @param array<CswMetadataLayer> $layers
     */
    public static function createFromParams(
        string $fileIdentifier,
        CswHierarchyLevel $hierarchyLevel,
        CswLanguage $language,
        string $charset,
        string $title,
        string $abstract,
        string $creationDate,
        array $thematicCategories,
        string $contactEmail,
        string $organisationName,
        string $organisationEmail,
        array $layers,
    ): self {
        $cswMetadata = self::createEmpty();
        $cswMetadata->fileIdentifier = trim($fileIdentifier);
        $cswMetadata->hierarchyLevel = $hierarchyLevel;
        $cswMetadata->language = $language;
        $cswMetadata->charset = trim($charset);
        $cswMetadata->title = trim($title);
        $cswMetadata->abstract = trim($abstract);
        $cswMetadata->creationDate = trim($creationDate);
        $cswMetadata->thematicCategories = self::trimStringArray($thematicCategories);
        $cswMetadata->contactEmail = trim($contactEmail);
        $cswMetadata->organisationName = trim($organisationName);
        $cswMetadata->organisationEmail = trim($organisationEmail);
        $cswMetadata->layers = $layers;

        return $cswMetadata;
    }

    /**
     * @param array<string> $array
     */
    private static function trimStringArray(array $array): array
    {
        return array_map(fn ($value) => trim($value), $array);
    }
}
