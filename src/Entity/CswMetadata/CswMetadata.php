<?php

namespace App\Entity\CswMetadata;

use App\Dto\Datasheet\LanguageDTO;
use App\Dto\Datasheet\ProducerDTO;
use App\Dto\Datasheet\ResourceConditionDTO;
use App\Dto\Datasheet\TerritoryDTO;

/**
 * Classe représentant une métadonnée du catalogue GeoNetwork.
 *
 * Vocabulaire unifié avec DatasheetMetadataDTO : les noms de propriétés sont identiques
 * à ceux du DTO de création ; le name-converter camelCase→snake_case produit le wire JSON attendu.
 *
 * @see https://en.wikipedia.org/wiki/GeoNetwork_opensource
 * @see https://en.wikipedia.org/wiki/Catalogue_Service_for_the_Web
 */
class CswMetadata
{
    public ?string $fileIdentifier;
    public ?CswHierarchyLevel $hierarchyLevel;

    /** Langue de la ressource (réutilise LanguageDTO, ex-CswLanguage). */
    public ?LanguageDTO $language;

    public ?string $charset;
    public ?string $name;
    public ?string $description;
    public ?string $dateCreation;

    /** Horodatage de la métadonnée (gmd:dateStamp), mis à jour par l'API Entrepôt. */
    public ?string $updateDate;

    public ?string $resourceGenealogy;

    /** @var array<string> */
    public ?array $keywordsInspire;

    /** @var array<string> */
    public ?array $keywordsAdditional;

    /** @var array<string> */
    public ?array $themes;

    /** @var ProducerDTO[] */
    public ?array $producers;

    /** @var ResourceConditionDTO[] */
    public ?array $resourceConstraints;

    /** @var TerritoryDTO[] */
    public ?array $territories;

    /** Résolution spatiale (passthrough fromXml — non alimenté par le nouveau formulaire). */
    public ?string $resolution;

    /** @var array<CswMetadataLayer> */
    public ?array $layers;

    /** @var array<CswStyleFile> */
    public ?array $styleFiles;

    /** @var array<CswCapabilitiesFile> */
    public ?array $capabilitiesFiles;

    /** @var array<CswDocument> */
    public ?array $documents;

    public ?string $thumbnailUrl;

    /** Fréquence de mise à jour (MD_MaintenanceFrequencyCode). */
    public ?string $updateFrequency;

    /**
     * Date de publication de la ressource sur cartes.gouv.fr (CI_DateTypeCode="publication").
     * Posée une seule fois à la création, préservée à chaque mise à jour.
     */
    public ?string $publicationDate;

    /**
     * Date de révision de la ressource (CI_DateTypeCode="revision").
     * Mise à jour automatiquement à chaque modification (métadonnée ou service).
     */
    public ?string $revisionDate;

    public function __construct()
    {
        $this->hierarchyLevel = CswHierarchyLevel::Series;
        $this->language = new LanguageDTO('fre', 'français');
        $this->charset = 'utf8';
        $this->thumbnailUrl = null;
        $this->resolution = null;
        $this->updateFrequency = 'unknown';
        $this->resourceGenealogy = '';
        $this->updateDate = '';
        $this->publicationDate = null;
        $this->revisionDate = null;

        $this->themes = [];
        $this->keywordsInspire = [];
        $this->keywordsAdditional = [];
        $this->producers = [];
        $this->resourceConstraints = [];
        $this->territories = [];
        $this->layers = [];
        $this->styleFiles = [];
        $this->capabilitiesFiles = [];
        $this->documents = [];
    }

    public function __clone()
    {
        $this->hierarchyLevel = CswHierarchyLevel::tryFrom($this->hierarchyLevel->value);
        if (null !== $this->language) {
            $this->language = new LanguageDTO($this->language->code, $this->language->language);
        }
    }
}
