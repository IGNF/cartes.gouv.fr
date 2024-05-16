<?php

namespace App\Services;

use App\Entity\CswMetadata\CswHierarchyLevel;
use App\Entity\CswMetadata\CswLanguage;
use App\Entity\CswMetadata\CswMetadata;
use App\Entity\CswMetadata\CswMetadataLayer;
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
        private Filesystem $fs
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
        $loaded = $doc->loadXML($metadataXml);

        $xpath = new \DOMXPath($doc);

        if (!$loaded) {
            throw new AppException('Load XML failed');
        }

        $cswMetadata = CswMetadata::createEmpty();

        /** @var \DOMNodeList<\DOMElement> $keywordsNodesList */
        $keywordsNodesList = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword');

        $keywordsList = array_map(fn (\DOMElement $keyword) => $keyword->textContent, iterator_to_array($keywordsNodesList));

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
            );
        }, iterator_to_array($layersNodesList));

        $cswMetadata->fileIdentifier = $xpath->query('/gmd:MD_Metadata/gmd:fileIdentifier/gco:CharacterString')->item(0)->textContent;
        $cswMetadata->hierarchyLevel = CswHierarchyLevel::tryFrom(trim($xpath->query('/gmd:MD_Metadata/gmd:hierarchyLevel/gmd:MD_ScopeCode')->item(0)->textContent));

        $cswMetadata->language = new CswLanguage(
            $xpath->query('/gmd:MD_Metadata/gmd:language/gmd:LanguageCode/@codeListValue')->item(0)->textContent,
            $xpath->query('/gmd:MD_Metadata/gmd:language/gmd:LanguageCode')->item(0)->textContent
        );

        $cswMetadata->charset = $xpath->query('/gmd:MD_Metadata/gmd:characterSet/gmd:MD_CharacterSetCode')->item(0)->textContent;
        $cswMetadata->title = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString')->item(0)->textContent;
        $cswMetadata->abstract = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:abstract/gco:CharacterString')->item(0)->textContent;
        $cswMetadata->creationDate = $xpath->query('/gmd:MD_Metadata/gmd:dateStamp/gco:Date')->item(0)->textContent;
        $cswMetadata->thematicCategories = $keywordsList;
        $cswMetadata->contactEmail = $xpath->query('/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString')->item(0)->textContent;
        $cswMetadata->organisationName = $xpath->query('/gmd:MD_Metadata/gmd:contact/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString')->item(0)->textContent;
        $cswMetadata->organisationEmail = $xpath->query('/gmd:MD_Metadata/gmd:contact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString')->item(0)->textContent;

        $cswMetadata->layers = $layersList;

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
}
