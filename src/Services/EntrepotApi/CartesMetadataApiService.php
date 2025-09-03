<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Entity\CswMetadata\CswCapabilitiesFile;
use App\Entity\CswMetadata\CswDocument;
use App\Entity\CswMetadata\CswHierarchyLevel;
use App\Entity\CswMetadata\CswInspireLicense;
use App\Entity\CswMetadata\CswLanguage;
use App\Entity\CswMetadata\CswMetadata;
use App\Entity\CswMetadata\CswMetadataLayer;
use App\Entity\CswMetadata\CswStyleFile;
use App\Exception\AppException;
use App\Exception\CartesApiException;
use App\Services\CswMetadataHelper;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Response;

/**
 * Service qui crée ou met à jour une métadonnée.
 *
 * - apiMetadata : objet metadata issu de l'API Entrepot
 * - cswMetadata : objet metadata issu du fichier lié à la metadata API
 */
class CartesMetadataApiService
{
    public function __construct(
        private ParameterBagInterface $parameterBag,
        private DatastoreApiService $datastoreApiService,
        private AnnexeApiService $annexeApiService,
        private MetadataApiService $metadataApiService,
        private ConfigurationApiService $configurationApiService,
        private CswMetadataHelper $cswMetadataHelper,
        private CartesStylesApiService $cartesStylesApiService,
        private StoredDataApiService $storedDataApiService,
    ) {
    }

    /**
     * Récupère la métadonnée liée à la fiche de données.
     *
     * @return array|null retourne null si aucune métadonnée liée n'a été trouvée
     */
    public function getMetadataByDatasheetName(string $datastoreId, string $datasheetName): ?array
    {
        $metadataList = $this->metadataApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        if (0 === count($metadataList)) {
            return null;
        }

        return $metadataList[0];
    }

    public function getThumbnailUrl(string $datastoreId, string $datasheetName): ?string
    {
        $annexeList = $this->annexeApiService->getAll($datastoreId, null, null, [
            sprintf('%s=%s', CommonTags::DATASHEET_NAME, $datasheetName),
            'type=thumbnail',
        ]);

        if (0 === count($annexeList)) {
            return null;
        }

        $datastore = $this->datastoreApiService->get($datastoreId);

        $annexeUrl = $this->parameterBag->get('annexes_url');

        return $annexeUrl.'/'.$datastore['technical_name'].$annexeList[0]['paths'][0];
    }

    /**
     * Met à jour la liste des flux si une métadonnée existante fait référence à une fiche de données, sinon fait rien.
     */
    public function updateLayers(string $datastoreId, string $datasheetName): void
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (!$apiMetadata) {
            return;
        }

        $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id']);

        $cswMetadata = $this->cswMetadataHelper->fromXml($apiMetadataXml);
        $cswMetadata->layers = $this->getMetadataLayers($datastoreId, $datasheetName);
        $cswMetadata->styleFiles = $this->getStyleFiles($datastoreId, $datasheetName);
        $cswMetadata->capabilitiesFiles = $this->getCapabilitiesFiles($datastoreId, $datasheetName);

        $xmlFilePath = $this->cswMetadataHelper->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);

        // dépublie la metadata (sans la supprimer) s'il n'y a plus de services publiés
        if (0 === count($cswMetadata->layers) && isset($apiMetadata['endpoints'][0]['_id'])) {
            $this->metadataApiService->unpublish($datastoreId, $cswMetadata->fileIdentifier, $apiMetadata['endpoints'][0]['_id']);
        }
    }

    public function updateStyleFiles(string $datastoreId, string $datasheetName): void
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (!$apiMetadata) {
            return;
        }

        $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id']);

        $cswMetadata = $this->cswMetadataHelper->fromXml($apiMetadataXml);
        $cswMetadata->styleFiles = $this->getStyleFiles($datastoreId, $datasheetName);

        $xmlFilePath = $this->cswMetadataHelper->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);
    }

    public function updateDocuments(string $datastoreId, string $datasheetName): void
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (!$apiMetadata) {
            return;
        }

        $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id']);

        $cswMetadata = $this->cswMetadataHelper->fromXml($apiMetadataXml);
        $cswMetadata->documents = $this->getDatasheetDocuments($datastoreId, $datasheetName);

        $xmlFilePath = $this->cswMetadataHelper->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);
    }

    /**
     * Crée ou met à jour la métadonnée liée à la fiche de données.
     *
     * @param array<mixed> $formData
     */
    public function createOrUpdate(string $datastoreId, string $datasheetName, ?array $formData = null): array
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);

        if (null === $apiMetadata) {
            // nouvelle métadonnée à créer

            if (null === $formData) { // n'est pas censé arriver
                throw new AppException('formData doit être non null si création de la métadonnée', Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $this->createMetadata($datastoreId, $datasheetName, $formData);
        } else {
            // une métadonnée existe déjà qu'on va mettre à jour

            return $this->updateMetadata($datastoreId, $datasheetName, $apiMetadata, $formData);
        }
    }

    /**
     * @param array<mixed> $formData
     */
    private function createMetadata(string $datastoreId, string $datasheetName, array $formData): array
    {
        $metadataEndpoint = $this->getMetadataEndpoint($datastoreId);

        $newCswMetadata = $this->getNewCswMetadata($datastoreId, $datasheetName, null, $formData);

        // Ajout de l'etiquette si elle n'existe pas deja
        $thumbnailUrl = $this->getThumbnailUrl($datastoreId, $datasheetName);
        if (!is_null($thumbnailUrl)) {
            $newCswMetadata->thumbnailUrl = $thumbnailUrl;
        }

        $newMetadataFilePath = $this->cswMetadataHelper->saveToFile($newCswMetadata);

        $newApiMetadata = $this->metadataApiService->add($datastoreId, $newMetadataFilePath);
        $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], [
            CommonTags::DATASHEET_NAME => $datasheetName,
        ]);

        $this->metadataApiService->publish($datastoreId, $newCswMetadata->fileIdentifier, $metadataEndpoint['_id']);

        $newApiMetadata['csw_metadata'] = $newCswMetadata;

        return $newApiMetadata;
    }

    /**
     * @param array<mixed> $oldApiMetadata
     * @param array<mixed> $formData
     */
    private function updateMetadata(string $datastoreId, string $datasheetName, array $oldApiMetadata, ?array $formData = null): array
    {
        $metadataEndpoint = $this->getMetadataEndpoint($datastoreId);

        $oldMetadataFileXml = $this->metadataApiService->downloadFile($datastoreId, $oldApiMetadata['_id']);
        $oldCswMetadata = $this->cswMetadataHelper->fromXml($oldMetadataFileXml);

        $newCswMetadata = $this->getNewCswMetadata($datastoreId, $datasheetName, $oldCswMetadata, $formData);

        // Mise a jour de l'etiquette
        $thumbnailUrl = $this->getThumbnailUrl($datastoreId, $datasheetName);
        if ($newCswMetadata->thumbnailUrl !== $thumbnailUrl) {
            $newCswMetadata->thumbnailUrl = $thumbnailUrl;
        }

        $newMetadataFilePath = $this->cswMetadataHelper->saveToFile($newCswMetadata);

        // suppression et recréation de métadonnées si changement de file_identifier
        if ($oldCswMetadata->fileIdentifier !== $newCswMetadata->fileIdentifier) {
            $this->metadataApiService->unpublish($datastoreId, $oldCswMetadata->fileIdentifier, $metadataEndpoint['_id']);
            $this->metadataApiService->delete($datastoreId, $oldApiMetadata['_id']);

            $newApiMetadata = $this->metadataApiService->add($datastoreId, $newMetadataFilePath);
        } else {
            $newApiMetadata = $this->metadataApiService->replaceFile($datastoreId, $oldApiMetadata['_id'], $newMetadataFilePath);
        }
        $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], $oldApiMetadata['tags']);

        if (0 === count($newApiMetadata['endpoints'])) { // la métadonnée n'est pas déjà publiée
            $this->metadataApiService->publish($datastoreId, $newCswMetadata->fileIdentifier, $metadataEndpoint['_id']);
        }

        $newApiMetadata['csw_metadata'] = $newCswMetadata;

        return $newApiMetadata;
    }

    /**
     * Construit l'objet metadata du catalogue pour une création ou modification. Si création, $formData est obligatoire. Si modification, $oldCswMetadata est obligatoire mais $formData est optionnel.
     *
     * @param ?array<mixed> $formData
     */
    private function getNewCswMetadata(string $datastoreId, string $datasheetName, ?CswMetadata $oldCswMetadata = null, ?array $formData = null): CswMetadata
    {
        if (null === $oldCswMetadata && null === $formData) {
            throw new AppException('oldCswMetadata et formData ne peuvent pas être null à la fois', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $newCswMetadata = null === $oldCswMetadata ? new CswMetadata() : clone $oldCswMetadata;

        $layers = $this->getMetadataLayers($datastoreId, $datasheetName);
        $bbox = $this->getBbox($datastoreId, $datasheetName);

        if ($formData) {
            $language = $formData['language'] ?
                 new CswLanguage($formData['language']['code'], $formData['language']['language'])
                 : CswLanguage::default();

            $newCswMetadata->fileIdentifier = $formData['identifier'];
            $newCswMetadata->hierarchyLevel = CswHierarchyLevel::tryFrom('' === $formData['hierarchy_level'] ? 'dataset' : $formData['hierarchy_level']);

            $newCswMetadata->language = $language;
            $newCswMetadata->charset = $formData['charset'];
            $newCswMetadata->title = $formData['public_name'];
            $newCswMetadata->abstract = $formData['description'];
            $newCswMetadata->creationDate = $formData['creation_date'];
            $newCswMetadata->topicCategories = $formData['category'] ?? [];
            $newCswMetadata->inspireKeywords = $formData['keywords'] ?? [];
            $newCswMetadata->freeKeywords = $formData['free_keywords'] ?? [];
            $newCswMetadata->contactEmail = $formData['email_contact'];
            $newCswMetadata->organisationName = $formData['organization'];
            $newCswMetadata->organisationEmail = $formData['organization_email'];
            $newCswMetadata->restriction = $formData['restriction'] ?? null;
            $newCswMetadata->openLicenseName = $formData['open_license_name'] ?? null;
            $newCswMetadata->openLicenseLink = $formData['open_license_link'] ?? null;
            $newCswMetadata->inspireLicense = CswInspireLicense::fromArray($formData['inspire_license'] ?? null);
            $newCswMetadata->inspireAccessConstraints = $formData['inspire_access_constraints'] ?? null;
            $newCswMetadata->inspireUseConstraints = $formData['inspire_use_constraints'] ?? null;
            $newCswMetadata->otherAccessConstraints = $formData['other_access_constraints'] ?? null;
            $newCswMetadata->otherUseConstraints = $formData['other_use_constraints'] ?? null;
            $newCswMetadata->resourceGenealogy = $formData['resource_genealogy'];
            $newCswMetadata->resolution = $formData['resolution'] ?? null;
            $newCswMetadata->frequencyCode = $formData['frequency_code'] ?? null;
            $newCswMetadata->layers = $layers;
            $newCswMetadata->bbox = $bbox;
            $newCswMetadata->styleFiles = $this->getStyleFiles($datastoreId, $datasheetName);

            // Doit-être calculé après la récupération des layers
            $newCswMetadata->capabilitiesFiles = $this->getCapabilitiesFiles($datastoreId, $datasheetName);
        }

        return $newCswMetadata;
    }

    /**
     * @return array<CswMetadataLayer>
     */
    private function getMetadataLayers(string $datastoreId, string $datasheetName): array
    {
        $configurationsList = $this->configurationApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $layers = [];

        foreach ($configurationsList as $configuration) {
            $configurationOfferings = $this->configurationApiService->getConfigurationOfferings($datastoreId, $configuration['_id']);

            if (count($configurationOfferings) > 0) {
                $offering = $configurationOfferings[0];
                $offering = $this->configurationApiService->getOffering($datastoreId, $offering['_id']);

                $serviceEndpoint = $this->datastoreApiService->getEndpoint($datastoreId, $offering['endpoint']['_id']);

                switch ($configuration['type']) {
                    case ConfigurationTypes::WFS:
                        $endpointUrl = $serviceEndpoint['endpoint']['urls'][0]['url'];
                        $subLayers = $this->getWfsSubLayers($datastoreId, $configuration, $offering, $endpointUrl);
                        $layers = array_merge($layers, $subLayers);

                        break;

                    case ConfigurationTypes::WMSRASTER:
                    case ConfigurationTypes::WMSVECTOR:
                        $layerName = $offering['layer_name'];
                        $gmdOnlineResourceProtocol = 'OGC:WMS';
                        $endpointUrl = $serviceEndpoint['endpoint']['urls'][0]['url'];

                        $layers[] = new CswMetadataLayer($layerName, $gmdOnlineResourceProtocol, $endpointUrl, $offering['_id'], $offering['open']);
                        break;

                    case ConfigurationTypes::WMTSTMS:
                        $layerName = $offering['layer_name'];
                        $configuration = $this->configurationApiService->get($datastoreId, $configuration['_id']);

                        if (!isset($configuration['type_infos']['used_data'][0]['stored_data'])) {
                            break;
                        }
                        $pyramid = $this->storedDataApiService->get($datastoreId, $configuration['type_infos']['used_data'][0]['stored_data']);

                        $gmdOnlineResourceProtocol = null;
                        $actualType = null;

                        if (StoredDataTypes::ROK4_PYRAMID_VECTOR === $pyramid['type']) {
                            $gmdOnlineResourceProtocol = 'TMS';
                            $actualType = 'TMS';
                        } elseif (StoredDataTypes::ROK4_PYRAMID_RASTER === $pyramid['type']) {
                            $gmdOnlineResourceProtocol = 'OGC:WMTS';
                            $actualType = 'WMTS';
                        }

                        $endpoints = array_filter($serviceEndpoint['endpoint']['urls'], fn (array $url) => $actualType === $url['type']);
                        $endpoints = array_values($endpoints);

                        if (count($endpoints) > 0) {
                            $layers[] = new CswMetadataLayer($layerName, $gmdOnlineResourceProtocol, $endpoints[0]['url'], $offering['_id'], $offering['open']);
                        }

                        break;
                }
            }
        }

        return $layers;
    }

    /**
     * @param array<mixed> $configuration
     * @param array<mixed> $offering
     *
     * @return array<CswMetadataLayer>
     */
    private function getWfsSubLayers(string $datastoreId, array $configuration, array $offering, string $serviceEndpointUrl): array
    {
        $configuration = $this->configurationApiService->get($datastoreId, $configuration['_id']);
        $configRelations = $configuration['type_infos']['used_data'][0]['relations'];

        $relationLayers = array_map(function ($relation) use ($offering, $serviceEndpointUrl) {
            $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['native_name']);
            $gmdOnlineResourceProtocol = 'OGC:WFS';

            return new CswMetadataLayer($layerName, $gmdOnlineResourceProtocol, $serviceEndpointUrl, $offering['_id'], $offering['open']);
        }, $configRelations);

        return $relationLayers;
    }

    /**
     * Seulement les services WFS et WMTS/WMS sont concernés par les fichiers de style.
     *
     * @return array<CswStyleFile>
     */
    private function getStyleFiles(string $datastoreId, string $datasheetName): array
    {
        $styleFiles = [];

        $configurationsList = array_merge(
            [],
            $this->configurationApiService->getAllDetailed($datastoreId, [
                'type' => ConfigurationTypes::WFS,
                'tags' => [
                    CommonTags::DATASHEET_NAME => $datasheetName,
                ],
            ]),
            $this->configurationApiService->getAllDetailed($datastoreId, [
                'type' => ConfigurationTypes::WMTSTMS,
                'tags' => [
                    CommonTags::DATASHEET_NAME => $datasheetName,
                ],
            ])
        );

        $configStyles = array_map(fn ($config) => $this->cartesStylesApiService->getStyles($datastoreId, $config), $configurationsList);
        $configStyles = array_filter($configStyles, fn ($stylesList) => count($stylesList) > 0);
        $configStyles = array_values($configStyles);
        $configStyles = array_merge([], ...$configStyles);

        foreach ($configStyles as $style) {
            $layers = $style['layers'];

            foreach ($layers as $layer) {
                $name = "Style {$style['name']}";
                $description = '';

                if (isset($layer['name'])) {
                    $name .= " - {$layer['name']}";
                    $description = sprintf('Style pour la couche %s', $layer['name']);
                }

                $styleFiles[] = new CswStyleFile(
                    $name,
                    $description,
                    $layer['url']
                );
            }
        }

        return $styleFiles;
    }

    private function getCapabilitiesFiles(string $datastoreId, string $datasheetName): array
    {
        $datastore = $this->datastoreApiService->get($datastoreId);
        $datastoreName = $datastore['technical_name'];

        $configurationsList = $this->configurationApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
            'status' => ConfigurationStatuses::PUBLISHED,
        ]);
        $layerTypes = array_map(fn ($config) => $config['type'], $configurationsList);
        $layerTypes = array_values(array_unique($layerTypes));

        $annexeUrl = $this->parameterBag->get('annexes_url');

        $capabilitiesFiles = [];
        foreach ($layerTypes as $type) {
            $endpoint = $this->getEndpoint($datastoreId, $type);
            if (!$endpoint) {
                continue;
            }

            $technicalName = $endpoint['technical_name'];

            $annexes = $this->annexeApiService->getAll($datastoreId, null, "/$technicalName/capabilities.xml");
            if (1 === count($annexes)) {
                $capabilitiesFiles[] = new CswCapabilitiesFile(
                    "GetCapabilities - $type",
                    $endpoint['name'],
                    "$annexeUrl/$datastoreName/$technicalName/capabilities.xml"
                );
            }
        }

        return $capabilitiesFiles;
    }

    /**
     * @return array<CswDocument>
     */
    private function getDatasheetDocuments(string $datastoreId, string $datasheetName): array
    {
        $labels = ["datasheet_name=$datasheetName", 'type=document-list'];

        $annexeList = $this->annexeApiService->getAll($datastoreId, null, null, $labels);

        // retourne l'annexe s'il existe
        if (0 === count($annexeList)) {
            return [];
        }

        $docsListJson = $this->annexeApiService->download($datastoreId, $annexeList[0]['_id']);
        $documentsList = json_decode($docsListJson, true);

        return array_map(fn ($doc) => new CswDocument(
            $doc['name'],
            isset($doc['description']) ? $doc['description'] : null,
            $doc['url'],
        ), $documentsList);
    }

    /**
     * @return array<mixed>|null
     */
    private function getEndpoint(string $datastoreId, string $type): ?array
    {
        $endpoints = $this->datastoreApiService->getEndpointsList($datastoreId, [
            'type' => $type,
            'open' => true,
        ]);

        return (1 === count($endpoints)) ? $endpoints[0]['endpoint'] : null;
    }

    private function getMetadataEndpoint(string $datastoreId): array
    {
        $endpointsList = $this->datastoreApiService->getEndpointsList($datastoreId, [
            'type' => 'METADATA',
            'open' => true,
        ]);
        if (0 === count($endpointsList)) {
            throw new CartesApiException("Point d'accès (endpoint) métadonnées n'a pas été trouvé");
        }

        return $endpointsList[0]['endpoint'];
    }

    private function getBbox(string $datastoreId, string $datasheetName): array
    {
        $storedDataList = $this->storedDataApiService->getAllDetailed($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $extents = [];
        foreach ($storedDataList as $storedData) {
            if (isset($storedData['extent'])) {
                $extents[] = $storedData['extent'];
            }
        }

        return $this->getBboxFromFeatures($extents);
    }

    /**
     * @param array<mixed> $features
     */
    private function getBboxFromFeatures(array $features): array
    {
        $minLat = $minLng = PHP_FLOAT_MAX;
        $maxLat = $maxLng = PHP_FLOAT_MIN;

        foreach ($features as $feature) {
            if (isset($feature['geometry']['coordinates'])) {
                $this->processCoordinates($feature['geometry']['coordinates'], $minLat, $minLng, $maxLat, $maxLng);
            }
        }

        return [
            'west' => $minLng,
            'south' => $minLat,
            'east' => $maxLng,
            'north' => $maxLat,
        ];
    }

    /**
     * @param array<mixed> $coordinates
     */
    private function processCoordinates(array $coordinates, float &$minLat, float &$minLng, float &$maxLat, float &$maxLng): void
    {
        if (is_array($coordinates[0])) {
            // récursif pour les arrays imbriqués (ex: MultiPolygon, MultiLineString)
            foreach ($coordinates as $subCoordinates) {
                $this->processCoordinates($subCoordinates, $minLat, $minLng, $maxLat, $maxLng);
            }
        } else {
            // cas basique : un ponctuel [lng, lat]
            $lng = $coordinates[0];
            $lat = $coordinates[1];
            $minLat = min($minLat, $lat);
            $minLng = min($minLng, $lng);
            $maxLat = max($maxLat, $lat);
            $maxLng = max($maxLng, $lng);
        }
    }
}
