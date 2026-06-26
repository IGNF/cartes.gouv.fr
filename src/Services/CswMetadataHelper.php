<?php

namespace App\Services;

use App\Dto\Datasheet\LanguageDTO;
use App\Dto\Datasheet\ProducerDTO;
use App\Dto\Datasheet\ResourceConditionDTO;
use App\Dto\Datasheet\SubConstraintDTO;
use App\Dto\Datasheet\TerritoryDTO;
use App\Entity\CswMetadata\CswCapabilitiesFile;
use App\Entity\CswMetadata\CswDocument;
use App\Entity\CswMetadata\CswHierarchyLevel;
use App\Entity\CswMetadata\CswMetadata;
use App\Entity\CswMetadata\CswMetadataLayer;
use App\Entity\CswMetadata\CswStyleFile;
use App\Exception\AppException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Uid\Uuid;
use Twig\Environment as Twig;

class CswMetadataHelper
{
    public function __construct(
        private Twig $twig,
        private ParameterBagInterface $params,
        private SerializerInterface $serializer,
        private Filesystem $fs,
    ) {
    }

    public function toArray(CswMetadata $metadata): array
    {
        $metadataJson = $this->toJson($metadata);

        return json_decode($metadataJson, true);
    }

    /**
     * @param array<mixed> $metadataArray
     */
    public function fromArray(array $metadataArray): CswMetadata
    {
        $metadataJson = json_encode($metadataArray);

        return $this->fromJson($metadataJson);
    }

    public function toJson(CswMetadata $metadata): string
    {
        return $this->serializer->serialize($metadata, 'json');
    }

    public function fromJson(string $metadataJson): CswMetadata
    {
        return $this->serializer->deserialize($metadataJson, CswMetadata::class, 'json');
    }

    public function toXml(CswMetadata $metadata): string
    {
        $metadataArray = $this->toArray($metadata);

        $content = $this->twig->render('metadata/metadata_dataset_iso.xml.twig', $metadataArray);

        return $content;
    }

    public function fromXml(string $metadataXml): CswMetadata
    {
        $doc = new \DOMDocument();
        try {
            $loaded = $doc->loadXML($metadataXml);
        } catch (\Throwable $th) {
            throw new AppException('Load XML failed');
        }

        $xpath = new \DOMXPath($doc);
        $xpath->registerNamespace('gmd', 'http://www.isotc211.org/2005/gmd');
        $xpath->registerNamespace('gco', 'http://www.isotc211.org/2005/gco');
        $xpath->registerNamespace('gmx', 'http://www.isotc211.org/2005/gmx');
        $xpath->registerNamespace('xlink', 'http://www.w3.org/1999/xlink');

        if (!$loaded) {
            throw new AppException('Load XML failed');
        }

        $cswMetadata = new CswMetadata();

        // --- Identifiants ---
        $cswMetadata->fileIdentifier = $xpath->query('/gmd:MD_Metadata/gmd:fileIdentifier/gco:CharacterString')->item(0)->textContent;
        $cswMetadata->hierarchyLevel = CswHierarchyLevel::tryFrom(trim($xpath->query('/gmd:MD_Metadata/gmd:hierarchyLevel/gmd:MD_ScopeCode/@codeListValue')->item(0)?->textContent));

        // --- Langue / charset ---
        $cswMetadata->language = new LanguageDTO(
            $xpath->query('/gmd:MD_Metadata/gmd:language/gmd:LanguageCode/@codeListValue')->item(0)->textContent,
            $xpath->query('/gmd:MD_Metadata/gmd:language/gmd:LanguageCode')->item(0)->textContent
        );
        $cswMetadata->charset = $xpath->query('/gmd:MD_Metadata/gmd:characterSet/gmd:MD_CharacterSetCode/@codeListValue')->item(0)?->textContent;

        // --- Titre / description ---
        $cswMetadata->name = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString')->item(0)?->textContent;
        $cswMetadata->description = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:abstract/gco:CharacterString')->item(0)?->textContent;

        // --- Dates de citation ---
        /** @var ?\DOMElement $creationDateEl */
        $creationDateEl = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:dateType/gmd:CI_DateTypeCode[@codeListValue="creation"]')->item(0)?->parentNode?->parentNode;
        $cswMetadata->dateCreation = $creationDateEl?->getElementsByTagName('date')[0]?->getElementsByTagName('Date')[0]?->textContent;

        /** @var ?\DOMElement $publicationDateEl */
        $publicationDateEl = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:dateType/gmd:CI_DateTypeCode[@codeListValue="publication"]')->item(0)?->parentNode?->parentNode;
        $cswMetadata->publicationDate = $publicationDateEl?->getElementsByTagName('date')[0]?->getElementsByTagName('Date')[0]?->textContent;

        /** @var ?\DOMElement $revisionDateEl */
        $revisionDateEl = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:dateType/gmd:CI_DateTypeCode[@codeListValue="revision"]')->item(0)?->parentNode?->parentNode;
        $cswMetadata->revisionDate = $revisionDateEl?->getElementsByTagName('date')[0]?->getElementsByTagName('Date')[0]?->textContent;

        // --- Horodatage métadonnée ---
        $cswMetadata->updateDate = $xpath->query('/gmd:MD_Metadata/gmd:dateStamp/gco:DateTime')->item(0)?->textContent;

        // --- Mots-clés ---
        /** @var \DOMNodeList<\DOMElement> $keywordsNodesList */
        $keywordsNodesList = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords');
        $keywords = $this->getKeywords($keywordsNodesList);
        $cswMetadata->keywordsInspire = $keywords['inspire_keywords'];
        $cswMetadata->keywordsAdditional = $keywords['free_keywords'];

        // --- Thématiques (topicCategory) ---
        /** @var \DOMNodeList<\DOMElement> $topicsNodesList */
        $topicsNodesList = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:topicCategory/gmd:MD_TopicCategoryCode');
        $cswMetadata->themes = array_map(
            fn (\DOMElement $topicElement) => $topicElement->textContent,
            iterator_to_array($topicsNodesList)
        );

        // --- Producteurs (gmd:pointOfContact dans identificationInfo) ---
        /** @var \DOMNodeList<\DOMElement> $producerNodes */
        $producerNodes = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty');
        $producers = [];
        foreach ($producerNodes as $partyEl) {
            $role = trim($xpath->evaluate('string(gmd:role/gmd:CI_RoleCode/@codeListValue)', $partyEl));
            $organizationName = trim($xpath->evaluate('string(gmd:organisationName/gco:CharacterString)', $partyEl));
            $organizationEmail = trim($xpath->evaluate('string(gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString)', $partyEl));
            $deliveryPoint = trim($xpath->evaluate('string(gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:deliveryPoint/gco:CharacterString)', $partyEl));
            $postalCode = trim($xpath->evaluate('string(gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:postalCode/gco:CharacterString)', $partyEl));
            $city = trim($xpath->evaluate('string(gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:city/gco:CharacterString)', $partyEl));

            $producers[] = new ProducerDTO(
                organization_name: $organizationName,
                organization_email: $organizationEmail,
                role: $role ?: 'pointOfContact',
                address_number_and_streetname: $deliveryPoint ?: null,
                address_postal_code: $postalCode ?: null,
                address_city: $city ?: null,
            );
        }
        $cswMetadata->producers = $producers;

        // --- Contact des métadonnées (gmd:contact racine) ---
        // Lire le gmd:contact racine et le comparer au pointOfContact.
        // Si différent, ajouter un ProducerDTO de rôle "contact" au tableau des producteurs.
        /** @var ?\DOMElement $rootContactEl */
        $rootContactEl = $xpath->query('/gmd:MD_Metadata/gmd:contact/gmd:CI_ResponsibleParty')->item(0);
        if (null !== $rootContactEl) {
            $rootOrgName = trim($xpath->evaluate('string(gmd:organisationName/gco:CharacterString)', $rootContactEl));
            $rootOrgEmail = trim($xpath->evaluate('string(gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString)', $rootContactEl));
            $rootDelivery = trim($xpath->evaluate('string(gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:deliveryPoint/gco:CharacterString)', $rootContactEl));
            $rootPostal = trim($xpath->evaluate('string(gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:postalCode/gco:CharacterString)', $rootContactEl));
            $rootCity = trim($xpath->evaluate('string(gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:city/gco:CharacterString)', $rootContactEl));

            // Ne traiter que si le contact racine contient au moins un nom ou un e-mail
            if ('' !== $rootOrgName || '' !== $rootOrgEmail) {
                // Récupérer le pointOfContact (index 0) pour comparaison
                $pointOfContact = $producers[0] ?? null;

                $contactIsIdentical = null !== $pointOfContact
                    && $rootOrgName === ($pointOfContact->organization_name ?? '')
                    && $rootOrgEmail === ($pointOfContact->organization_email ?? '')
                    && ($rootDelivery ?: null) === $pointOfContact->address_number_and_streetname
                    && ($rootPostal ?: null) === $pointOfContact->address_postal_code
                    && ($rootCity ?: null) === $pointOfContact->address_city;

                if (!$contactIsIdentical) {
                    $cswMetadata->producers[] = new ProducerDTO(
                        organization_name: $rootOrgName,
                        organization_email: $rootOrgEmail,
                        role: 'contact',
                        address_number_and_streetname: $rootDelivery ?: null,
                        address_postal_code: $rootPostal ?: null,
                        address_city: $rootCity ?: null,
                    );
                }
            }
        }

        // --- Contraintes (gmd:resourceConstraints) ---
        /** @var \DOMNodeList<\DOMElement> $constraintNodes */
        $constraintNodes = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:resourceConstraints');
        $resourceConstraints = [];
        foreach ($constraintNodes as $constraintEl) {
            $legalEl = $constraintEl->getElementsByTagName('MD_LegalConstraints')[0] ?? null;
            $securityEl = $constraintEl->getElementsByTagName('MD_SecurityConstraints')[0] ?? null;
            $otherEl = $constraintEl->getElementsByTagName('MD_Constraints')[0] ?? null;

            if ($legalEl) {
                $type = 'legal';
                $containerEl = $legalEl;
            } elseif ($securityEl) {
                $type = 'security';
                $containerEl = $securityEl;
            } elseif ($otherEl) {
                $type = 'other';
                $containerEl = $otherEl;
            } else {
                continue;
            }

            $subConstraints = $this->parseSubConstraints($xpath, $containerEl);
            if (count($subConstraints) > 0) {
                $resourceConstraints[] = new ResourceConditionDTO(type: $type, constraints: $subConstraints);
            }
        }
        $cswMetadata->resourceConstraints = $resourceConstraints;

        // --- Territoires avec emprise (un <gmd:extent> par territoire depuis notre template) ---
        // Chaque extent contient : description (titre), EX_GeographicBoundingBox (bbox), EX_GeographicDescription (code ISO 3166).
        /** @var \DOMNodeList<\DOMElement> $extentNodes */
        $extentNodes = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:extent/gmd:EX_Extent');
        $territories = [];
        foreach ($extentNodes as $extentEl) {
            // récupère le code ISO 3166 alpha-3 du territoire
            $id = trim($xpath->evaluate(
                'string(gmd:geographicElement/gmd:EX_GeographicDescription/gmd:geographicIdentifier/gmd:MD_Identifier/gmd:code/gco:CharacterString)',
                $extentEl
            ));
            if (!$id) {
                continue;
            }

            $title = trim($xpath->evaluate('string(gmd:description/gco:CharacterString)', $extentEl));

            // bbox du territoire
            $bbox = [];
            /** @var ?\DOMElement $bboxEl */
            $bboxEl = $xpath->query('gmd:geographicElement/gmd:EX_GeographicBoundingBox', $extentEl)->item(0);
            if (null !== $bboxEl) {
                $bbox = [
                    floatval($bboxEl->getElementsByTagName('westBoundLongitude')->item(0)->getElementsByTagName('Decimal')[0]->textContent),
                    floatval($bboxEl->getElementsByTagName('southBoundLatitude')->item(0)->getElementsByTagName('Decimal')[0]->textContent),
                    floatval($bboxEl->getElementsByTagName('eastBoundLongitude')->item(0)->getElementsByTagName('Decimal')[0]->textContent),
                    floatval($bboxEl->getElementsByTagName('northBoundLatitude')->item(0)->getElementsByTagName('Decimal')[0]->textContent),
                ];
            }

            $territories[] = new TerritoryDTO(id: $id, title: $title, bbox: $bbox);
        }
        $cswMetadata->territories = $territories;

        // --- Résolution ---
        $cswMetadata->resolution = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:spatialResolution/gmd:MD_Resolution/gmd:equivalentScale/gmd:MD_RepresentativeFraction/gmd:denominator/gco:Integer')->item(0)?->textContent;

        // --- Thumbnail ---
        $cswMetadata->thumbnailUrl = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:graphicOverview/gmd:MD_BrowseGraphic/gmd:fileName/gco:CharacterString')->item(0)?->textContent;

        // --- Fréquence de mise à jour ---
        $cswMetadata->updateFrequency = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:resourceMaintenance/gmd:MD_MaintenanceInformation/gmd:maintenanceAndUpdateFrequency/gmd:MD_MaintenanceFrequencyCode/@codeListValue')->item(0)?->textContent;

        // --- Généalogie ---
        $cswMetadata->resourceGenealogy = $xpath->query('/gmd:MD_Metadata/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:lineage/gmd:LI_Lineage/gmd:statement/gco:CharacterString')->item(0)?->textContent;

        // --- Couches / fichiers de distribution ---
        $cswMetadata->layers = $this->getLayers($xpath);

        /** @var \DOMNodeList<\DOMElement> $styleFilesNodesList */
        $styleFilesNodesList = $xpath->query('/gmd:MD_Metadata/gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine[@type="style"]');
        $styleFilesList = array_map(function (\DOMElement $styleFile) {
            /** @var \DOMElement $onlineEl */
            $onlineEl = $styleFile->getElementsByTagName('CI_OnlineResource')[0];

            return new CswStyleFile(
                $onlineEl->getElementsByTagName('name')[0]?->getElementsByTagName('CharacterString')[0]?->textContent,
                $onlineEl->getElementsByTagName('description')[0]?->getElementsByTagName('CharacterString')[0]?->textContent,
                $onlineEl->getElementsByTagName('linkage')[0]?->getElementsByTagName('URL')[0]?->textContent,
            );
        }, iterator_to_array($styleFilesNodesList));
        $cswMetadata->styleFiles = $styleFilesList;

        /** @var \DOMNodeList<\DOMElement> $capabilitiesFilesNodesList */
        $capabilitiesFilesNodesList = $xpath->query('/gmd:MD_Metadata/gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine[@type="getcapabilities"]');
        $capabilitiesFilesList = array_map(function (\DOMElement $styleFile) {
            /** @var \DOMElement $onlineEl */
            $onlineEl = $styleFile->getElementsByTagName('CI_OnlineResource')[0];

            return new CswCapabilitiesFile(
                $onlineEl->getElementsByTagName('name')[0]?->getElementsByTagName('CharacterString')[0]?->textContent,
                $onlineEl->getElementsByTagName('description')[0]?->getElementsByTagName('CharacterString')[0]?->textContent,
                $onlineEl->getElementsByTagName('linkage')[0]?->getElementsByTagName('URL')[0]?->textContent,
            );
        }, iterator_to_array($capabilitiesFilesNodesList));
        $cswMetadata->capabilitiesFiles = $capabilitiesFilesList;

        /** @var \DOMNodeList<\DOMElement> $documentsNodesList */
        $documentsNodesList = $xpath->query('/gmd:MD_Metadata/gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine[@type="document"]');
        $documentsList = array_map(function (\DOMElement $document) {
            /** @var \DOMElement $onlineEl */
            $onlineEl = $document->getElementsByTagName('CI_OnlineResource')[0];

            return new CswDocument(
                $onlineEl->getElementsByTagName('name')[0]?->getElementsByTagName('CharacterString')[0]?->textContent,
                $onlineEl->getElementsByTagName('description')[0]?->getElementsByTagName('CharacterString')[0]?->textContent,
                $onlineEl->getElementsByTagName('linkage')[0]?->getElementsByTagName('URL')[0]?->textContent,
            );
        }, iterator_to_array($documentsNodesList));
        $cswMetadata->documents = $documentsList;

        return $this->trim($cswMetadata);
    }

    public function saveToFile(CswMetadata $cswMetadata): string
    {
        $content = $this->toXml($cswMetadata);

        $directory = $this->params->get('metadata_path');
        $uuid = Uuid::v4();
        $filePath = $directory.DIRECTORY_SEPARATOR."{$uuid}.xml";

        $this->fs->dumpFile($filePath, $content);

        return $filePath;
    }

    private function trim(CswMetadata $cswMetadata): CswMetadata
    {
        $properties = get_object_vars($cswMetadata);

        foreach ($properties as $property => $value) {
            if (is_string($value)) {
                $cswMetadata->$property = trim($value);
            }

            if (is_array($value)) {
                $cswMetadata->$property = $this->trimStringArray($value);
            }
        }

        return $cswMetadata;
    }

    /**
     * @param array<mixed> $array
     */
    private function trimStringArray(array $array): array
    {
        return array_map(fn ($value) => is_string($value) ? trim($value) : $value, $array);
    }

    /**
     * @return array<CswMetadataLayer>
     */
    private function getLayers(\DOMXPath $xpath): array
    {
        /** @var \DOMNodeList<\DOMElement> $gmdOnlineList */
        $gmdOnlineList = $xpath->query('/gmd:MD_Metadata/gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource');

        /** @var array<CswMetadataLayer> */
        $layersList = [];
        foreach ($gmdOnlineList as $onlineResource) {
            /** @var \DOMElement $onlineResource */

            // layers
            $protocol = trim($xpath->evaluate('string(gmd:protocol)', $onlineResource));
            if (!empty($protocol)) {
                // Détecter si la couche est privée en vérifiant la présence d'une description d'accès restreint
                $offeringOpen = true;
                $privateApplicationProfile = 'http://inspire.ec.europa.eu/metadata-codelist/SpatialDataServiceType/other';
                $applicationProfile = $xpath->evaluate('string(gmd:applicationProfile/gmx:Anchor/@xlink:href)', $onlineResource);
                $descriptionHref = $xpath->evaluate('string(gmd:description/gmx:Anchor/@xlink:href)', $onlineResource);
                $description = $xpath->evaluate('string(gmd:description)', $onlineResource);

                if ($privateApplicationProfile === $applicationProfile && str_contains($descriptionHref ?? '', 'MD_RestrictionCode_restricted')) {
                    $offeringOpen = false;
                }

                // offeringId n'est pas lu depuis le XML : il est systématiquement re-dérivé de l'API
                // live dans getMetadataLayers() avant tout usage ; la chaîne vide est un placeholder.
                $layersList[] = new CswMetadataLayer(
                    trim($xpath->evaluate('string(gmd:name)', $onlineResource)),
                    $protocol,
                    trim($xpath->evaluate('string(gmd:linkage)', $onlineResource)),
                    '',
                    $offeringOpen,
                    $description ? trim($description) : null
                );
            }
        }

        return $layersList;
    }

    /**
     * @param \DOMNodeList<\DOMElement> $keywordsNodesList
     */
    private function getKeywords($keywordsNodesList): array
    {
        $inspireKeywords = [];
        $freeKeywords = [];

        foreach ($keywordsNodesList as $list) {
            $hasThesaurus = false;

            $keywords = [];
            foreach ($list->childNodes as $child) {
                if ('gmd:thesaurusName' === $child->nodeName) {
                    $hasThesaurus = true;
                } elseif ('gmd:keyword' === $child->nodeName) {
                    $keywords[] = $child->textContent;
                }
            }

            if ($hasThesaurus) {
                $inspireKeywords = array_merge($inspireKeywords, $keywords);
            } else {
                $freeKeywords = array_merge($freeKeywords, $keywords);
            }
        }

        return [
            'inspire_keywords' => $inspireKeywords,
            'free_keywords' => $freeKeywords,
        ];
    }

    /**
     * Parse les sous-contraintes d'un élément MD_*Constraints.
     *
     * @return SubConstraintDTO[]
     */
    private function parseSubConstraints(\DOMXPath $xpath, \DOMElement $containerEl): array
    {
        $subConstraints = [];

        // useConstraints / accessConstraints (MD_RestrictionCode)
        $useConstraintsNodes = $containerEl->getElementsByTagName('useConstraints');
        foreach ($useConstraintsNodes as $node) {
            $restrictionCode = trim($xpath->evaluate('string(gmd:MD_RestrictionCode/@codeListValue)', $node));
            if ($restrictionCode) {
                $subConstraints[] = new SubConstraintDTO(
                    type: 'useConstraints',
                    locked: false,
                    restriction_code: $restrictionCode,
                );
            }
        }

        $accessConstraintsNodes = $containerEl->getElementsByTagName('accessConstraints');
        foreach ($accessConstraintsNodes as $node) {
            $restrictionCode = trim($xpath->evaluate('string(gmd:MD_RestrictionCode/@codeListValue)', $node));
            if ($restrictionCode) {
                $subConstraints[] = new SubConstraintDTO(
                    type: 'accessConstraints',
                    locked: false,
                    restriction_code: $restrictionCode,
                );
            }
        }

        // otherConstraints (gmx:Anchor pour INSPIRE art.13, gco:CharacterString pour texte libre)
        $otherConstraintsNodes = $containerEl->getElementsByTagName('otherConstraints');
        foreach ($otherConstraintsNodes as $node) {
            $anchorHref = trim($xpath->evaluate('string(gmx:Anchor/@xlink:href)', $node));
            $charString = trim($xpath->evaluate('string(gco:CharacterString)', $node));
            if ($anchorHref) {
                // limitation_code = dernière partie de l'URI INSPIRE
                $parts = explode('/', rtrim($anchorHref, '/'));
                $limitationCode = end($parts);
                $subConstraints[] = new SubConstraintDTO(
                    type: 'otherConstraints',
                    locked: false,
                    limitation_code: $limitationCode,
                );
            } elseif ($charString) {
                $subConstraints[] = new SubConstraintDTO(
                    type: 'useLimitation',
                    locked: false,
                    description: $charString,
                );
            }
        }

        // useLimitation
        $useLimitationNodes = $containerEl->getElementsByTagName('useLimitation');
        foreach ($useLimitationNodes as $node) {
            $text = trim($xpath->evaluate('string(gco:CharacterString)', $node));
            if ($text) {
                $subConstraints[] = new SubConstraintDTO(
                    type: 'useLimitation',
                    locked: false,
                    description: $text,
                );
            }
        }

        // classification (MD_ClassificationCode)
        $classificationNodes = $containerEl->getElementsByTagName('classification');
        foreach ($classificationNodes as $node) {
            $classificationCode = trim($xpath->evaluate('string(gmd:MD_ClassificationCode/@codeListValue)', $node));
            if ($classificationCode) {
                $subConstraints[] = new SubConstraintDTO(
                    type: 'classification',
                    locked: false,
                    classification_code: $classificationCode,
                );
            }
        }

        return $subConstraints;
    }
}
