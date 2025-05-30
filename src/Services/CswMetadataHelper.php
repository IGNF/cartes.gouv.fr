<?php

namespace App\Services;

use App\Entity\CswMetadata\CswCapabilitiesFile;
use App\Entity\CswMetadata\CswDocument;
use App\Entity\CswMetadata\CswHierarchyLevel;
use App\Entity\CswMetadata\CswLanguage;
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

        if (!$loaded) {
            throw new AppException('Load XML failed');
        }

        $cswMetadata = new CswMetadata();

        /** @var \DOMNodeList<\DOMElement> $keywordsNodesList */
        $keywordsNodesList = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords');
        $this->getKeywords($cswMetadata, $keywordsNodesList);

        /** @var \DOMNodeList<\DOMElement> $topicsNodesList */
        $topicsNodesList = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:topicCategory/gmd:MD_TopicCategoryCode');
        $cswMetadata->topicCategories = array_map(
            fn (\DOMElement $topicElement) => $topicElement->textContent,
            iterator_to_array($topicsNodesList)
        );

        /** @var \DOMNodeList<\DOMElement> $layersNodesList */
        $layersNodesList = $xpath->query('/gmd:MD_Metadata/gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine[@type="offering"]');

        $layersList = array_map(function (\DOMElement $layer) {
            /** @var \DOMElement $onlineEl */
            $onlineEl = $layer->getElementsByTagName('CI_OnlineResource')[0];

            return new CswMetadataLayer(
                $onlineEl->getElementsByTagName('name')[0]?->getElementsByTagName('CharacterString')[0]?->textContent,
                $onlineEl->getElementsByTagName('protocol')[0]?->getElementsByTagName('CharacterString')[0]?->textContent,
                $onlineEl->getElementsByTagName('linkage')[0]?->getElementsByTagName('URL')[0]?->textContent,
                $layer->getAttribute('offeringId'),
                filter_var($layer->getAttribute('offeringOpen'), FILTER_VALIDATE_BOOLEAN),
            );
        }, iterator_to_array($layersNodesList));
        $cswMetadata->layers = $layersList;

        /** @var ?\DOMElement $exBboxEl */
        $exBboxEl = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:extent/gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox')->item(0);
        if (null !== $exBboxEl) {
            $cswMetadata->bbox = [
                'west' => floatval($exBboxEl->getElementsByTagName('westBoundLongitude')->item(0)->getElementsByTagName('Decimal')[0]->textContent),
                'east' => floatval($exBboxEl->getElementsByTagName('eastBoundLongitude')->item(0)->getElementsByTagName('Decimal')[0]->textContent),
                'south' => floatval($exBboxEl->getElementsByTagName('southBoundLatitude')->item(0)->getElementsByTagName('Decimal')[0]->textContent),
                'north' => floatval($exBboxEl->getElementsByTagName('northBoundLatitude')->item(0)->getElementsByTagName('Decimal')[0]->textContent),
            ];
        }

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

        $cswMetadata->fileIdentifier = $xpath->query('/gmd:MD_Metadata/gmd:fileIdentifier/gco:CharacterString')->item(0)->textContent;
        $cswMetadata->hierarchyLevel = CswHierarchyLevel::tryFrom(trim($xpath->query('/gmd:MD_Metadata/gmd:hierarchyLevel/gmd:MD_ScopeCode/@codeListValue')->item(0)?->textContent));

        $cswMetadata->resourceGenealogy = $xpath->query('/gmd:MD_Metadata/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:lineage/gmd:LI_Lineage/gmd:statement/gco:CharacterString')->item(0)?->textContent;

        $cswMetadata->language = new CswLanguage(
            $xpath->query('/gmd:MD_Metadata/gmd:language/gmd:LanguageCode/@codeListValue')->item(0)->textContent,
            $xpath->query('/gmd:MD_Metadata/gmd:language/gmd:LanguageCode')->item(0)->textContent
        );

        $cswMetadata->charset = $xpath->query('/gmd:MD_Metadata/gmd:characterSet/gmd:MD_CharacterSetCode/@codeListValue')->item(0)?->textContent;
        $cswMetadata->title = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString')->item(0)?->textContent;
        $cswMetadata->abstract = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:abstract/gco:CharacterString')->item(0)?->textContent;

        // creation_date
        /** @var ?\DOMElement $creationDateElement */
        $creationDateElement = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:dateType/gmd:CI_DateTypeCode[@codeListValue="creation"]')->item(0)?->parentNode?->parentNode;
        $cswMetadata->creationDate = $creationDateElement?->getElementsByTagName('date')[0]?->getElementsByTagName('Date')[0]?->textContent;

        $cswMetadata->updateDate = $xpath->query('/gmd:MD_Metadata/gmd:dateStamp/gco:DateTime')->item(0)?->textContent;

        $cswMetadata->organisationEmail = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString')->item(0)?->textContent;
        $cswMetadata->organisationName = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString')->item(0)?->textContent;
        $cswMetadata->contactEmail = $xpath->query('/gmd:MD_Metadata/gmd:contact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString')->item(0)?->textContent;

        $cswMetadata->resolution = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:spatialResolution/gmd:MD_Resolution/gmd:equivalentScale/gmd:MD_RepresentativeFraction/gmd:denominator/gco:Integer')->item(0)?->textContent;

        // Thumbnail
        $cswMetadata->thumbnailUrl = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:graphicOverview/gmd:MD_BrowseGraphic/gmd:fileName/gco:CharacterString')->item(0)?->textContent;

        // Frequency
        $cswMetadata->frequencyCode = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:resourceMaintenance/gmd:MD_MaintenanceInformation/gmd:maintenanceAndUpdateFrequency/gmd:MD_MaintenanceFrequencyCode/@codeListValue')->item(0)?->textContent;

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
     * @param \DOMNodeList<\DOMElement> $keywordsNodesList
     */
    private function getKeywords(CswMetadata $cswMetadata, $keywordsNodesList): void
    {
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
                $cswMetadata->inspireKeywords = array_merge($cswMetadata->inspireKeywords, $keywords);
            } else {
                $cswMetadata->freeKeywords = array_merge($cswMetadata->freeKeywords, $keywords);
            }
        }
    }
}
