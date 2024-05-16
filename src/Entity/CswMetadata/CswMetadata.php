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
    public ?string $fileIdentifier;
    public ?CswHierarchyLevel $hierarchyLevel;
    public ?CswLanguage $language;
    public ?string $charset;
    public ?string $title;
    public ?string $abstract;
    public ?string $creationDate;

    /** @var array<string> */
    public ?array $thematicCategories;
    public ?string $contactEmail;
    public ?string $organisationName;
    public ?string $organisationEmail;

    /** @var array<CswMetadataLayer> */
    public ?array $layers;

    public ?string $thumbnailUrl;

    public static function createEmpty(): self
    {
        $empty = new self();
        $empty->hierarchyLevel = CswHierarchyLevel::Series;
        $empty->language = CswLanguage::default();
        $empty->charset = 'utf8';

        return $empty;
    }

    public function __clone()
    {
        $this->hierarchyLevel = CswHierarchyLevel::tryFrom($this->hierarchyLevel->value);
        $this->language = new CswLanguage($this->language->code, $this->language->language);
    }
}
