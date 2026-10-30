<?php

namespace App\Entity\CswMetadata;

use App\Exception\AppException;

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
    public ?string $updateDate;
    public ?string $resourceGenealogy;

    /** @var array<string> */
    public ?array $inspireKeywords;

    /** @var array<string> */
    public ?array $freeKeywords;

    /** @var array<string> */
    public ?array $topicCategories;

    public ?string $contactEmail;
    public ?string $organisationName;
    public ?string $organisationEmail;

    public ?string $resolution;

    /** @var array<CswMetadataLayer> */
    public ?array $layers;

    /** @var ?array<string,float> */
    public ?array $bbox;

    /** @var array<CswStyleFile> */
    public ?array $styleFiles;

    /** @var array<CswCapabilitiesFile> */
    public ?array $capabilitiesFiles;

    /** @var array<CswDocument> */
    public ?array $documents;

    public ?string $thumbnailUrl;
    public ?string $frequencyCode;

    public function __construct()
    {
        $this->hierarchyLevel = CswHierarchyLevel::Series;
        $this->language = CswLanguage::default();
        $this->charset = 'utf8';
        $this->thumbnailUrl = null;
        $this->resolution = null;
        $this->frequencyCode = 'unknown';
        $this->resourceGenealogy = '';
        $this->updateDate = '';

        $this->topicCategories = [];
        $this->inspireKeywords = [];
        $this->freeKeywords = [];
        $this->layers = [];
        $this->bbox = null;
        $this->styleFiles = [];
        $this->capabilitiesFiles = [];
        $this->documents = [];
    }

    public function requireFileIdentifier(): string
    {
        return $this->fileIdentifier ?? throw new AppException('Métadonnée sans identifiant de fichier (file_identifier)');
    }

    // l’énumération hierarchyLevel est immuable, seule la langue est un objet à dupliquer
    public function __clone()
    {
        if ($this->language instanceof CswLanguage) {
            $this->language = clone $this->language;
        }
    }
}
