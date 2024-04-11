<?php

namespace App\Services;

use App\Constants\MetadataFields;
use App\Exception\AppException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Uid\Uuid;
use Twig\Environment as Twig;

class MetadataHelper
{
    private Filesystem $fs;

    public function __construct(
        private Twig $twig,
        private ParameterBagInterface $params
    ) {
        $this->fs = new Filesystem();
    }

    /**
     * @param array<string,mixed> $args
     */
    public function convertArrayToXml(array $args): string
    {
        $requiredFields = [
            MetadataFields::FILE_IDENTIFIER,
            MetadataFields::HIERARCHY_LEVEL,
            MetadataFields::LANGUAGE,
            MetadataFields::CHARSET,
        ];

        foreach ($requiredFields as $fieldName) {
            if (!array_key_exists($fieldName, $args)) {
                throw new AppException(sprintf('Required field "%s" not provided', $fieldName));
            }
        }

        $content = $this->twig->render('metadata/metadata_dataset_iso.xml.twig', $args);

        return $content;
    }

    public function convertXmlToArray(string $metadataXml): array
    {
        $doc = new \DOMDocument();
        $loaded = $doc->loadXML($metadataXml);

        if (!$loaded) {
            throw new AppException('Load XML failed');
        }

        /** @var \DOMNodeList<\DOMElement> $keywordsNodes */
        $keywordsNodes = $doc->getElementsByTagName('identificationInfo')[0]
                                                    ?->getElementsByTagName('MD_DataIdentification')[0]
                                                    ?->getElementsByTagName('descriptiveKeywords')[0]
                                                    ?->getElementsByTagName('MD_Keywords')[0]
                                                    ?->getElementsByTagName('keyword');

        $keywordsList = array_map(fn (\DOMElement $keyword) => $keyword->textContent, iterator_to_array($keywordsNodes));

        /** @var \DOMNodeList<\DOMElement> $layersNodesList */
        $layersNodesList = $doc->getElementsByTagName('distributionInfo')[0]
                                                    ?->getElementsByTagName('MD_Distribution')[0]
                                                    ?->getElementsByTagName('transferOptions')[0]
                                                    ?->getElementsByTagName('MD_DigitalTransferOptions')[0]
                                                    ?->getElementsByTagName('onLine');

        $layersList = array_map(function (\DOMElement $layer) {
            /**
             * @var ?\DOMElement $onlineEl
             */
            $onlineEl = $layer->getElementsByTagName('CI_OnlineResource')[0];

            return [
                MetadataFields::LAYER_NAME => $onlineEl?->getElementsByTagName('name')[0]?->getElementsByTagName('CharacterString')[0]?->textContent,
                MetadataFields::LAYER_ENDPOINT_TYPE => $onlineEl?->getElementsByTagName('protocol')[0]?->getElementsByTagName('CharacterString')[0]?->textContent,
                MetadataFields::LAYER_ENDPOINT_URL => $onlineEl?->getElementsByTagName('linkage')[0]?->getElementsByTagName('URL')[0]?->textContent,
                MetadataFields::LAYER_OFFERING_ID => $layer->getAttribute('offeringId'),
            ];
        }, iterator_to_array($layersNodesList));

        /** @var ?\DOMElement */
        $languageNode = $doc->getElementsByTagName('language')[0]
        ?->getElementsByTagName('LanguageCode')[0];
        $language = [
            MetadataFields::LANGUAGE_CODE => $languageNode?->getAttribute('codeListValue'),
            MetadataFields::LANGUAGE_TEXT => $languageNode->textContent,
        ];

        $metadataArray = [
            MetadataFields::FILE_IDENTIFIER => $doc->getElementsByTagName('fileIdentifier')[0]
                                                    ?->getElementsByTagName('CharacterString')[0]
                                                    ?->textContent,
            MetadataFields::HIERARCHY_LEVEL => $doc->getElementsByTagName('hierarchyLevel')[0]
                                                    ?->getElementsByTagName('MD_ScopeCode')[0]
                                                    ?->textContent,
            MetadataFields::LANGUAGE => $language,
            MetadataFields::CHARSET => $doc->getElementsByTagName('characterSet')[0]
                                                    ?->getElementsByTagName('MD_CharacterSetCode')[0]
                                                    ?->getAttribute('codeListValue'),
            MetadataFields::TITLE => $doc->getElementsByTagName('identificationInfo')[0]
                                                    ?->getElementsByTagName('MD_DataIdentification')[0]
                                                    ?->getElementsByTagName('citation')[0]
                                                    ?->getElementsByTagName('CI_Citation')[0]
                                                    ?->getElementsByTagName('title')[0]
                                                    ?->getElementsByTagName('CharacterString')[0]
                                                    ?->textContent,
            MetadataFields::ABSTRACT => $doc->getElementsByTagName('identificationInfo')[0]
                                                    ?->getElementsByTagName('MD_DataIdentification')[0]
                                                    ?->getElementsByTagName('abstract')[0]
                                                    ?->getElementsByTagName('CharacterString')[0]
                                                    ?->textContent,
            MetadataFields::CREATION_DATE => $doc->getElementsByTagName('dateStamp')[0]
                                                    ?->getElementsByTagName('Date')[0]
                                                    ?->textContent,
            MetadataFields::THEMATIC_CATEGORIES => $keywordsList,
            MetadataFields::CONTACT_EMAIL => $doc->getElementsByTagName('identificationInfo')[0]
                                                    ?->getElementsByTagName('MD_DataIdentification')[0]
                                                    ?->getElementsByTagName('pointOfContact')[0]
                                                    ?->getElementsByTagName('CI_ResponsibleParty')[0]
                                                    ?->getElementsByTagName('contactInfo')[0]
                                                    ?->getElementsByTagName('CI_Contact')[0]
                                                    ?->getElementsByTagName('address')[0]
                                                    ?->getElementsByTagName('CI_Address')[0]
                                                    ?->getElementsByTagName('electronicMailAddress')[0]
                                                    ?->getElementsByTagName('CharacterString')[0]
                                                    ?->textContent,
            MetadataFields::ORGANISATION_NAME => $doc->getElementsByTagName('contact')[0]
                                                    ?->getElementsByTagName('CI_ResponsibleParty')[0]
                                                    ?->getElementsByTagName('organisationName')[0]
                                                    ?->getElementsByTagName('CharacterString')[0]
                                                    ?->textContent,
            MetadataFields::ORGANISATION_EMAIL => $doc->getElementsByTagName('contact')[0]
                                                    ?->getElementsByTagName('CI_ResponsibleParty')[0]
                                                    ?->getElementsByTagName('contactInfo')[0]
                                                    ?->getElementsByTagName('CI_Contact')[0]
                                                    ?->getElementsByTagName('address')[0]
                                                    ?->getElementsByTagName('CI_Address')[0]
                                                    ?->getElementsByTagName('electronicMailAddress')[0]
                                                    ?->getElementsByTagName('CharacterString')[0]
                                                    ?->textContent,
            MetadataFields::LAYERS => $layersList,
        ];

        $metadataArray = $this->trimArrayValues($metadataArray);

        return $metadataArray;
    }

    public function saveToFile(string $content): string
    {
        $directory = $this->params->get('metadata_path');
        $uuid = Uuid::v4();
        $filePath = $directory.DIRECTORY_SEPARATOR."{$uuid}.xml";

        $this->fs->dumpFile($filePath, $content);

        return $filePath;
    }

    /**
     * @param array<mixed> $array
     */
    private function trimArrayValues(array $array): array
    {
        return array_map(fn ($value) => is_array($value) ? $this->trimArrayValues($value) : trim($value), $array);
    }
}