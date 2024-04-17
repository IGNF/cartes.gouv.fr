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
    public function __construct(
        public string $fileIdentifier,
        public CswHierarchyLevel $hierarchyLevel,
        public CswLanguage $language,
        public string $charset,
        public string $title,
        public string $abstract,
        public string $creationDate,

        /** @var array<string> */
        public array $thematicCategories,
        public string $contactEmail,
        public string $organisationName,
        public string $organisationEmail,

        /** @var array<CswMetadataLayer> */
        public array $layers,
    ) {
        $this->hierarchyLevel = CswHierarchyLevel::Series;
        $this->language = CswLanguage::default();
        $this->charset = 'utf8';
    }
}
