<?php

declare(strict_types=1);

namespace App\Services;

use App\Dto\Datasheet\ProducerDTO;
use App\Dto\Metadata\CswHierarchyLevel;
use App\Dto\Metadata\CswLanguage;
use App\Dto\Metadata\CswMetadata;
use App\Dto\Metadata\CswOnlineResource;
use App\Dto\Metadata\CswOnlineResourceType;
use App\Exception\InvalidCswMetadataException;
use App\Exception\MissingCswMetadataException;

/**
 * Lit un fichier de métadonnée ISO 19139 (fichier de l’Entrepôt ou réponse CSW GetRecordById) en CswMetadata.
 */
class CswMetadataXmlReader
{
    private const NAMESPACES = [
        'gmd' => 'http://www.isotc211.org/2005/gmd',
        'gco' => 'http://www.isotc211.org/2005/gco',
        'gmx' => 'http://www.isotc211.org/2005/gmx',
        'xlink' => 'http://www.w3.org/1999/xlink',
    ];

    private const IDENTIFICATION = 'gmd:identificationInfo/gmd:MD_DataIdentification';
    private const ONLINE_RESOURCES = 'gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine';
    private const RESTRICTED_ACCESS_PROFILE = 'http://inspire.ec.europa.eu/metadata-codelist/SpatialDataServiceType/other';

    /** @var array<string, string> propriété de CswMetadata => expression XPath relative à gmd:MD_Metadata */
    private const TEXT_FIELDS = [
        'file_identifier' => 'gmd:fileIdentifier/gco:CharacterString',
        'charset' => 'gmd:characterSet/gmd:MD_CharacterSetCode/@codeListValue',
        'name' => self::IDENTIFICATION.'/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString',
        'description' => self::IDENTIFICATION.'/gmd:abstract/gco:CharacterString',
        'date_creation' => self::IDENTIFICATION.'/gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date[gmd:dateType/gmd:CI_DateTypeCode/@codeListValue="creation"]/gmd:date/gco:Date',
        'resource_genealogy' => 'gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:lineage/gmd:LI_Lineage/gmd:statement/gco:CharacterString',
        'thumbnail_url' => self::IDENTIFICATION.'/gmd:graphicOverview/gmd:MD_BrowseGraphic/gmd:fileName/gco:CharacterString',
    ];

    public function read(string $xml): CswMetadata
    {
        [$xpath, $root] = $this->load($xml);

        $metadata = new CswMetadata();
        foreach (self::TEXT_FIELDS as $property => $expression) {
            $metadata->$property = $this->text($xpath, $expression, $root);
        }

        $metadata->hierarchy_level = CswHierarchyLevel::tryFrom($this->text($xpath, 'gmd:hierarchyLevel/gmd:MD_ScopeCode/@codeListValue', $root) ?? '');

        $languageCode = $this->text($xpath, 'gmd:language/gmd:LanguageCode/@codeListValue', $root);
        $languageName = $this->text($xpath, 'gmd:language/gmd:LanguageCode', $root);
        if (null === $languageCode || null === $languageName) {
            throw new InvalidCswMetadataException('langue (gmd:language) absente');
        }
        $metadata->language = new CswLanguage($languageCode, $languageName);

        $frequencyCode = $this->text($xpath, self::IDENTIFICATION.'/gmd:resourceMaintenance/gmd:MD_MaintenanceInformation/gmd:maintenanceAndUpdateFrequency/gmd:MD_MaintenanceFrequencyCode/@codeListValue', $root);
        // fiches publiées avec l’ancienne faute de frappe « quaterly »
        $metadata->update_frequency = 'quaterly' === $frequencyCode ? 'quarterly' : $frequencyCode;

        $scale = $this->text($xpath, self::IDENTIFICATION.'/gmd:spatialResolution/gmd:MD_Resolution/gmd:equivalentScale/gmd:MD_RepresentativeFraction/gmd:denominator/gco:Integer', $root);
        $metadata->scale = null === $scale ? null : (int) $scale;

        $metadata->producers = $this->producers($xpath, $root);
        $metadata->themes = $this->texts($xpath, self::IDENTIFICATION.'/gmd:topicCategory/gmd:MD_TopicCategoryCode', $root);
        [$metadata->keywords_inspire, $metadata->keywords_additional] = $this->keywords($xpath, $root);
        $metadata->bbox = $this->bbox($xpath, $root);
        $metadata->online_resources = $this->onlineResources($xpath, $root);

        return $metadata;
    }

    /**
     * @return array{0: \DOMXPath, 1: \DOMElement} requêteur du document et élément gmd:MD_Metadata
     */
    private function load(string $xml): array
    {
        // corps vide ou réduit à la déclaration XML : réponse CSW sans enregistrement
        if ('' === trim((string) preg_replace('/^\s*<\?xml[^>]*\?>/', '', $xml))) {
            throw new MissingCswMetadataException();
        }

        $previous = libxml_use_internal_errors(true);
        libxml_clear_errors();
        $document = new \DOMDocument();
        $loaded = $document->loadXML($xml, LIBXML_NONET);
        $error = libxml_get_errors()[0] ?? null;
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if (!$loaded) {
            throw new InvalidCswMetadataException(sprintf('XML mal formé (%s)', trim($error->message ?? 'erreur inconnue')));
        }

        $root = $document->getElementsByTagNameNS(self::NAMESPACES['gmd'], 'MD_Metadata')->item(0);
        if (!$root instanceof \DOMElement) {
            throw new MissingCswMetadataException();
        }

        $xpath = new \DOMXPath($document);
        foreach (self::NAMESPACES as $prefix => $uri) {
            $xpath->registerNamespace($prefix, $uri);
        }

        return [$xpath, $root];
    }

    // texte de la première occurrence (élément ou attribut), null si absente
    private function text(\DOMXPath $xpath, string $expression, \DOMNode $context): ?string
    {
        $node = $this->query($xpath, $expression, $context)->item(0);

        return $node instanceof \DOMNode ? trim($node->textContent) : null;
    }

    /**
     * @return list<string>
     */
    private function texts(\DOMXPath $xpath, string $expression, \DOMNode $context): array
    {
        return array_map(fn (\DOMElement $element) => trim($element->textContent), $this->elements($xpath, $expression, $context));
    }

    /**
     * @return list<\DOMElement>
     */
    private function elements(\DOMXPath $xpath, string $expression, \DOMNode $context): array
    {
        $elements = [];
        foreach ($this->query($xpath, $expression, $context) as $node) {
            if ($node instanceof \DOMElement) {
                $elements[] = $node;
            }
        }

        return $elements;
    }

    /**
     * @return \DOMNodeList<\DOMNameSpaceNode|\DOMNode>
     */
    private function query(\DOMXPath $xpath, string $expression, \DOMNode $context): \DOMNodeList
    {
        return $xpath->query($expression, $context) ?: throw new \LogicException("Expression XPath invalide : $expression");
    }

    /**
     * @return array{0: list<string>, 1: list<string>} mots-clés INSPIRE (bloc avec thésaurus), mots-clés libres
     */
    private function keywords(\DOMXPath $xpath, \DOMElement $root): array
    {
        $inspire = [];
        $free = [];
        foreach ($this->elements($xpath, self::IDENTIFICATION.'/gmd:descriptiveKeywords/gmd:MD_Keywords', $root) as $block) {
            $keywords = $this->texts($xpath, 'gmd:keyword', $block);
            if ([] !== $this->elements($xpath, 'gmd:thesaurusName', $block)) {
                $inspire = [...$inspire, ...$keywords];
            } else {
                $free = [...$free, ...$keywords];
            }
        }

        return [$inspire, $free];
    }

    /**
     * Points de contact de la ressource, puis le contact des métadonnées sous le rôle contact.
     *
     * @return list<ProducerDTO>
     */
    private function producers(\DOMXPath $xpath, \DOMElement $root): array
    {
        $producers = [];
        foreach ($this->elements($xpath, self::IDENTIFICATION.'/gmd:pointOfContact/gmd:CI_ResponsibleParty', $root) as $party) {
            // fichier d’avant la refonte : organisation unique sans rôle
            $producers[] = $this->producer($xpath, $party, $this->text($xpath, 'gmd:role/gmd:CI_RoleCode/@codeListValue', $party) ?: 'pointOfContact');
        }
        // le formulaire verrouille le point de contact en première position
        usort($producers, fn (ProducerDTO $a, ProducerDTO $b) => ('pointOfContact' === $b->role) <=> ('pointOfContact' === $a->role));

        $contact = $this->elements($xpath, 'gmd:contact/gmd:CI_ResponsibleParty', $root)[0] ?? null;
        if (null !== $contact) {
            $producers[] = $this->producer($xpath, $contact, 'contact');
        }

        // gestionnaire et contact sont copiés du point de contact à la soumission : la copie est repliée à la lecture
        $pointOfContact = $producers[0] ?? null;

        return array_values(array_filter($producers, fn (ProducerDTO $producer) => !(
            $pointOfContact instanceof ProducerDTO
            && 'pointOfContact' === $pointOfContact->role
            && in_array($producer->role, ['contact', 'custodian'], true)
            && $producer->sameOrganizationAs($pointOfContact)
        )));
    }

    private function producer(\DOMXPath $xpath, \DOMElement $party, string $role): ProducerDTO
    {
        $address = 'gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/';

        return new ProducerDTO(
            $this->text($xpath, 'gmd:organisationName/gco:CharacterString', $party) ?? '',
            $this->text($xpath, $address.'gmd:electronicMailAddress/gco:CharacterString', $party) ?? '',
            $role,
            $this->text($xpath, $address.'gmd:deliveryPoint/gco:CharacterString', $party),
            $this->text($xpath, $address.'gmd:postalCode/gco:CharacterString', $party),
            $this->text($xpath, $address.'gmd:city/gco:CharacterString', $party),
        );
    }

    /**
     * @return array{west: float, east: float, south: float, north: float}|null
     */
    private function bbox(\DOMXPath $xpath, \DOMElement $root): ?array
    {
        $bbox = $this->elements($xpath, self::IDENTIFICATION.'/gmd:extent/gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox', $root)[0] ?? null;
        if (null === $bbox) {
            return null;
        }

        $coordinate = function (string $tagName) use ($xpath, $bbox): float {
            $value = $this->text($xpath, "gmd:$tagName/gco:Decimal", $bbox);

            return floatval($value ?? throw new InvalidCswMetadataException("coordonnée $tagName absente de l’emprise"));
        };

        return [
            'west' => $coordinate('westBoundLongitude'),
            'east' => $coordinate('eastBoundLongitude'),
            'south' => $coordinate('southBoundLatitude'),
            'north' => $coordinate('northBoundLatitude'),
        ];
    }

    /**
     * @return list<CswOnlineResource>
     */
    private function onlineResources(\DOMXPath $xpath, \DOMElement $root): array
    {
        $resources = [];
        foreach ($this->elements($xpath, self::ONLINE_RESOURCES, $root) as $onLine) {
            $resource = $this->elements($xpath, 'gmd:CI_OnlineResource', $onLine)[0] ?? null;
            if (null === $resource) {
                continue;
            }

            $name = $this->text($xpath, 'gmd:name', $resource) ?? '';
            $protocol = $this->text($xpath, 'gmd:protocol', $resource) ?: null;
            $type = $this->resourceType($protocol, $onLine->getAttribute('type'));
            // fichier d’avant la refonte : sans protocole, la ressource réécrite ne serait plus classable
            $protocol ??= $this->legacyProtocol($type, $name);

            // couche privée : profil « other » et description ancrée sur MD_RestrictionCode_restricted
            $profile = $this->text($xpath, 'gmd:applicationProfile/gmx:Anchor/@xlink:href', $resource);
            $descriptionHref = $this->text($xpath, 'gmd:description/gmx:Anchor/@xlink:href', $resource) ?? '';
            $restricted = CswOnlineResourceType::Layer === $type && self::RESTRICTED_ACCESS_PROFILE === $profile && str_contains($descriptionHref, 'MD_RestrictionCode_restricted');

            $resources[] = new CswOnlineResource(
                $type,
                $name,
                $this->text($xpath, 'gmd:linkage', $resource) ?? '',
                $protocol,
                $this->text($xpath, 'gmd:description', $resource) ?: null,
                !$restricted,
            );
        }

        return $resources;
    }

    private function resourceType(?string $protocol, string $legacyType): CswOnlineResourceType
    {
        if (null !== $protocol) {
            if (str_ends_with($protocol, CswOnlineResource::CAPABILITIES_PROTOCOL_SUFFIX)) {
                return CswOnlineResourceType::Capabilities;
            }
            if (CswOnlineResource::STYLE_PROTOCOL === $protocol) {
                return CswOnlineResourceType::Style;
            }
            if (CswOnlineResource::DOCUMENT_PROTOCOL === $protocol) {
                return CswOnlineResourceType::Document;
            }
            if (in_array($protocol, CswOnlineResource::LAYER_PROTOCOLS, true)) {
                return CswOnlineResourceType::Layer;
            }
        }

        // shortcut: attribut type="..." hors standard des fichiers publiés avant la refonte, à retirer quand le catalogue n’en contient plus
        return match ($legacyType) {
            'offering' => CswOnlineResourceType::Layer,
            'style' => CswOnlineResourceType::Style,
            'getcapabilities' => CswOnlineResourceType::Capabilities,
            'document' => CswOnlineResourceType::Document,
            default => CswOnlineResourceType::Other,
        };
    }

    // shortcut: le service du GetCapabilities est lu dans son nom (« GetCapabilities - WFS »), version par défaut ; à retirer avec le repli sur type="..."
    private function legacyProtocol(CswOnlineResourceType $type, string $name): ?string
    {
        return match ($type) {
            CswOnlineResourceType::Style => CswOnlineResource::STYLE_PROTOCOL,
            CswOnlineResourceType::Document => CswOnlineResource::DOCUMENT_PROTOCOL,
            CswOnlineResourceType::Capabilities => CswOnlineResource::capabilitiesProtocol(match (true) {
                str_contains($name, 'WFS') => 'WFS',
                str_contains($name, 'WMTS') => 'WMTS',
                default => 'WMS',
            }),
            default => null,
        };
    }
}
