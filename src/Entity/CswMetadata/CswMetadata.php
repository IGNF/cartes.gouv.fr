<?php

namespace App\Entity\CswMetadata;

use App\Exception\AppException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Attribute\SerializedName;

/**
 * Classe représentant une métadonnée du catalogue GeoNetwork.
 *
 * @see https://en.wikipedia.org/wiki/GeoNetwork_opensource
 * @see https://en.wikipedia.org/wiki/Catalogue_Service_for_the_Web
 */
class CswMetadata
{
    #[SerializedName('file_identifier')]
    public ?string $fileIdentifier;
    #[SerializedName('hierarchy_level')]
    public ?CswHierarchyLevel $hierarchyLevel;
    public ?CswLanguage $language;
    public ?string $charset;
    public ?string $title;
    public ?string $abstract;
    #[SerializedName('creation_date')]
    public ?string $creationDate;
    #[SerializedName('update_date')]
    public ?string $updateDate;
    #[SerializedName('resource_genealogy')]
    public ?string $resourceGenealogy;

    /** @var array<string> */
    #[SerializedName('inspire_keywords')]
    public ?array $inspireKeywords;

    /** @var array<string> */
    #[SerializedName('free_keywords')]
    public ?array $freeKeywords;

    /** @var array<string> */
    #[SerializedName('topic_categories')]
    public ?array $topicCategories;

    #[SerializedName('contact_email')]
    public ?string $contactEmail;
    #[SerializedName('organisation_name')]
    public ?string $organisationName;
    #[SerializedName('organisation_email')]
    public ?string $organisationEmail;

    public ?string $resolution;

    /** @var array<CswMetadataLayer> */
    public ?array $layers;

    /** @var ?array<string,float> */
    public ?array $bbox;

    /** @var array<CswStyleFile> */
    #[SerializedName('style_files')]
    public ?array $styleFiles;

    /** @var array<CswCapabilitiesFile> */
    #[SerializedName('capabilities_files')]
    public ?array $capabilitiesFiles;

    /** @var array<CswDocument> */
    public ?array $documents;

    #[SerializedName('thumbnail_url')]
    public ?string $thumbnailUrl;
    #[SerializedName('frequency_code')]
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
        return $this->fileIdentifier ?? throw new AppException('Métadonnée sans identifiant de fichier (file_identifier)', Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    // l’énumération hierarchyLevel est immuable, seule la langue est un objet à dupliquer
    public function __clone()
    {
        if ($this->language instanceof CswLanguage) {
            $this->language = clone $this->language;
        }
    }
}
