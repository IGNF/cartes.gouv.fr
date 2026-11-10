<?php

declare(strict_types=1);

namespace App\Dto\Metadata;

use App\Exception\AppException;
use Symfony\Component\HttpFoundation\Response;

/**
 * Métadonnée ISO 19139 d’une fiche de données, lue et écrite par CswMetadataXmlReader et CswMetadataXmlWriter.
 *
 * Le fichier XML est le seul stockage de ces champs : toute propriété écrite doit être relue.
 *
 * @see https://en.wikipedia.org/wiki/Catalogue_Service_for_the_Web
 */
class CswMetadata
{
    public ?string $file_identifier = null;
    public ?CswHierarchyLevel $hierarchy_level = CswHierarchyLevel::Series;
    public ?CswLanguage $language;
    public ?string $charset = 'utf8';
    public ?string $name = null;
    public ?string $description = null;
    public ?string $date_creation = null;
    public ?string $resource_genealogy = null;

    /** @var list<string> */
    public array $keywords_inspire = [];

    /** @var list<string> */
    public array $keywords_additional = [];

    /** @var list<string> */
    public array $themes = [];

    public ?string $contact_email = null;
    public ?string $organisation_name = null;
    public ?string $organisation_email = null;

    public ?int $scale = null;

    /** @var list<CswOnlineResource> couches, styles, GetCapabilities et documents, dans cet ordre */
    public array $online_resources = [];

    /** @var array{west: float, east: float, south: float, north: float}|null */
    public ?array $bbox = null;

    public ?string $thumbnail_url = null;
    public ?string $update_frequency = 'unknown';

    public function __construct()
    {
        $this->language = CswLanguage::default();
    }

    public function requireFileIdentifier(): string
    {
        return $this->file_identifier ?? throw new AppException('Métadonnée sans identifiant de fichier (file_identifier)', Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    /**
     * @return list<CswOnlineResource>
     */
    public function resourcesOfType(CswOnlineResourceType ...$types): array
    {
        return array_values(array_filter($this->online_resources, fn (CswOnlineResource $resource) => in_array($resource->type, $types, true)));
    }

    /**
     * Remplace les ressources des types donnés par $resources, les autres sont conservées ; l’ordre des types reste celui de l’énumération.
     *
     * @param list<CswOnlineResourceType> $types
     * @param list<CswOnlineResource>     $resources
     */
    public function replaceResources(array $types, array $resources): void
    {
        $kept = array_filter($this->online_resources, fn (CswOnlineResource $resource) => !in_array($resource->type, $types, true));
        $merged = [...$kept, ...$resources];
        $order = array_flip(array_column(CswOnlineResourceType::cases(), 'value'));
        usort($merged, fn (CswOnlineResource $a, CswOnlineResource $b) => $order[$a->type->value] <=> $order[$b->type->value]);

        $this->online_resources = $merged;
    }

    // l’énumération hierarchyLevel est immuable ; la langue et les ressources sont des objets à dupliquer
    public function __clone()
    {
        if ($this->language instanceof CswLanguage) {
            $this->language = clone $this->language;
        }
        $this->online_resources = array_map(fn (CswOnlineResource $resource) => clone $resource, $this->online_resources);
    }
}
