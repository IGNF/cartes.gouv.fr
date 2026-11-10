<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Dto\Datasheet\DatasheetServices;
use App\Dto\Datasheet\ProducerDTO;
use App\Dto\Metadata\CswHierarchyLevel;
use App\Dto\Metadata\CswLanguage;
use App\Dto\Metadata\CswMetadata;
use App\Dto\Metadata\CswOnlineResource;
use App\Dto\Metadata\CswOnlineResourceType;
use App\Exception\AppException;
use App\Services\CswMetadataXmlReader;
use App\Services\CswMetadataXmlWriter;
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
        private readonly ParameterBagInterface $parameterBag,
        private readonly DatastoreApiService $datastoreApiService,
        private readonly AnnexeApiService $annexeApiService,
        private readonly MetadataApiService $metadataApiService,
        private readonly CswMetadataXmlReader $cswMetadataReader,
        private readonly CswMetadataXmlWriter $cswMetadataWriter,
        private readonly CartesStylesApiService $cartesStylesApiService,
        private readonly StoredDataApiService $storedDataApiService,
    ) {
    }

    /**
     * Récupère la métadonnée liée à la fiche de données.
     *
     * @return array<mixed>|null retourne null si aucune métadonnée liée n'a été trouvée
     */
    public function getMetadataByDatasheetName(string $datastoreId, string $datasheetName): ?array
    {
        $metadataList = $this->metadataApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ])->resolve();

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
        ])->resolve();

        if (0 === count($annexeList)) {
            return null;
        }

        return $this->annexeApiService->getAbsoluteUrl($datastoreId, $annexeList[0]);
    }

    /**
     * Met à jour la liste des flux si une métadonnée existante fait référence à une fiche de données, sinon fait rien.
     */
    public function updateLayers(string $datastoreId, string $datasheetName, DatasheetServices $services): void
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (!$apiMetadata) {
            return;
        }

        $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id'])->text();

        $cswMetadata = $this->cswMetadataReader->read($apiMetadataXml);
        $this->replaceServiceResources($cswMetadata, $datastoreId, $services);

        $xmlFilePath = $this->cswMetadataWriter->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);

        // dépublie la metadata (sans la supprimer) s'il n'y a plus de services publiés
        if ([] === $cswMetadata->resourcesOfType(CswOnlineResourceType::Layer) && isset($apiMetadata['endpoints'][0]['_id'])) {
            $this->metadataApiService->unpublish($datastoreId, $cswMetadata->requireFileIdentifier(), $apiMetadata['endpoints'][0]['_id'])->await();
        }
    }

    /**
     * @param array<array<mixed>> $configurations configurations détaillées de la fiche
     */
    public function updateStyleFiles(string $datastoreId, string $datasheetName, array $configurations): void
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (!$apiMetadata) {
            return;
        }

        $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id'])->text();

        $cswMetadata = $this->cswMetadataReader->read($apiMetadataXml);
        $cswMetadata->replaceResources([CswOnlineResourceType::Style], $this->getStyleFiles($datastoreId, $configurations));

        $xmlFilePath = $this->cswMetadataWriter->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);
    }

    /**
     * @param array<mixed> $documents liste de documents de la fiche, déjà en main chez l'appelant
     */
    public function updateDocuments(string $datastoreId, string $datasheetName, array $documents): void
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (!$apiMetadata) {
            return;
        }

        $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id'])->text();

        $cswMetadata = $this->cswMetadataReader->read($apiMetadataXml);
        $cswMetadata->replaceResources([CswOnlineResourceType::Document], $this->toCswDocuments($documents));

        $xmlFilePath = $this->cswMetadataWriter->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);
    }

    /**
     * Crée ou met à jour la métadonnée liée à la fiche de données.
     *
     * @param array<mixed> $formData
     *
     * @return array<mixed>
     */
    public function createOrUpdate(string $datastoreId, string $datasheetName, DatasheetServices $services, ?array $formData = null): array
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);

        if (null === $apiMetadata) {
            // nouvelle métadonnée à créer

            if (null === $formData) { // n'est pas censé arriver
                throw new AppException('formData doit être non null si création de la métadonnée', Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $this->createMetadata($datastoreId, $datasheetName, $services, $formData);
        }
        // une métadonnée existe déjà qu'on va mettre à jour

        return $this->updateMetadata($datastoreId, $datasheetName, $services, $apiMetadata, $formData);
    }

    /**
     * @param array<mixed> $formData
     *
     * @return array<mixed>
     */
    private function createMetadata(string $datastoreId, string $datasheetName, DatasheetServices $services, array $formData): array
    {
        $metadataEndpoint = $this->getMetadataEndpoint($datastoreId);

        $newCswMetadata = $this->getNewCswMetadata($datastoreId, $datasheetName, $services, null, $formData);

        // Ajout de l'etiquette si elle n'existe pas deja
        $thumbnailUrl = $this->getThumbnailUrl($datastoreId, $datasheetName);
        if (!is_null($thumbnailUrl)) {
            $newCswMetadata->thumbnail_url = $thumbnailUrl;
        }

        $newMetadataFilePath = $this->cswMetadataWriter->saveToFile($newCswMetadata);

        $newApiMetadata = $this->metadataApiService->add($datastoreId, $newMetadataFilePath);
        $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], [
            CommonTags::DATASHEET_NAME => $datasheetName,
        ])->array();

        $this->metadataApiService->publish($datastoreId, $newCswMetadata->requireFileIdentifier(), $metadataEndpoint['_id'])->await();

        $newApiMetadata['csw_metadata'] = $newCswMetadata;

        return $newApiMetadata;
    }

    /**
     * @param array<mixed> $oldApiMetadata
     * @param array<mixed> $formData
     *
     * @return array<mixed>
     */
    private function updateMetadata(string $datastoreId, string $datasheetName, DatasheetServices $services, array $oldApiMetadata, ?array $formData = null): array
    {
        $metadataEndpoint = $this->getMetadataEndpoint($datastoreId);

        $oldMetadataFileXml = $this->metadataApiService->downloadFile($datastoreId, $oldApiMetadata['_id'])->text();
        $oldCswMetadata = $this->cswMetadataReader->read($oldMetadataFileXml);

        $newCswMetadata = $this->getNewCswMetadata($datastoreId, $datasheetName, $services, $oldCswMetadata, $formData);

        // Mise a jour de l'etiquette
        $thumbnailUrl = $this->getThumbnailUrl($datastoreId, $datasheetName);
        if ($newCswMetadata->thumbnail_url !== $thumbnailUrl) {
            $newCswMetadata->thumbnail_url = $thumbnailUrl;
        }

        $newMetadataFilePath = $this->cswMetadataWriter->saveToFile($newCswMetadata);

        // suppression et recréation de métadonnées si changement de file_identifier
        if ($oldCswMetadata->file_identifier !== $newCswMetadata->file_identifier) {
            $this->metadataApiService->unpublish($datastoreId, $oldCswMetadata->requireFileIdentifier(), $metadataEndpoint['_id'])->await();
            $this->metadataApiService->delete($datastoreId, $oldApiMetadata['_id'])->await();

            $newApiMetadata = $this->metadataApiService->add($datastoreId, $newMetadataFilePath);
        } else {
            $newApiMetadata = $this->metadataApiService->replaceFile($datastoreId, $oldApiMetadata['_id'], $newMetadataFilePath);
        }
        $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], $oldApiMetadata['tags'])->array();

        if (0 === count($newApiMetadata['endpoints'])) { // la métadonnée n'est pas déjà publiée
            $this->metadataApiService->publish($datastoreId, $newCswMetadata->requireFileIdentifier(), $metadataEndpoint['_id'])->await();
        }

        $newApiMetadata['csw_metadata'] = $newCswMetadata;

        return $newApiMetadata;
    }

    /**
     * Construit l'objet metadata du catalogue pour une création ou modification. Si création, $formData est obligatoire. Si modification, $oldCswMetadata est obligatoire mais $formData est optionnel.
     *
     * @param ?array<mixed> $formData
     */
    private function getNewCswMetadata(string $datastoreId, string $datasheetName, DatasheetServices $services, ?CswMetadata $oldCswMetadata = null, ?array $formData = null): CswMetadata
    {
        if (!$oldCswMetadata instanceof CswMetadata && null === $formData) {
            throw new AppException('oldCswMetadata et formData ne peuvent pas être null à la fois', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $newCswMetadata = $oldCswMetadata instanceof CswMetadata ? clone $oldCswMetadata : new CswMetadata();

        if ($formData) {
            $language = $formData['language'] ?
                 new CswLanguage($formData['language']['code'], $formData['language']['language'])
                 : CswLanguage::default();

            $newCswMetadata->file_identifier = $formData['identifier'];
            $newCswMetadata->hierarchy_level = CswHierarchyLevel::tryFrom('' === $formData['hierarchy_level'] ? 'dataset' : $formData['hierarchy_level']);

            $newCswMetadata->language = $language;
            $newCswMetadata->charset = $formData['charset'];
            $newCswMetadata->name = $formData['public_name'];
            $newCswMetadata->description = $formData['description'];
            $newCswMetadata->date_creation = $formData['creation_date'];
            $newCswMetadata->themes = $formData['category'] ?? [];
            $newCswMetadata->keywords_inspire = $formData['keywords'] ?? [];
            $newCswMetadata->keywords_additional = $formData['free_keywords'] ?? [];
            $newCswMetadata->producers = [
                new ProducerDTO($formData['organization'] ?? '', $formData['organization_email'] ?? '', 'pointOfContact'),
                new ProducerDTO($formData['organization'] ?? '', $formData['email_contact'] ?? '', 'contact'),
            ];
            $newCswMetadata->resource_genealogy = $formData['resource_genealogy'];
            $newCswMetadata->scale = is_numeric($formData['resolution'] ?? null) ? (int) $formData['resolution'] : null;
            $newCswMetadata->update_frequency = $formData['frequency_code'] ?? null;
            $this->replaceServiceResources($newCswMetadata, $datastoreId, $services);
        }

        return $newCswMetadata;
    }

    // couches, styles et GetCapabilities rebâtis depuis l’API ; documents et autres ressources conservés
    private function replaceServiceResources(CswMetadata $cswMetadata, string $datastoreId, DatasheetServices $services): void
    {
        $cswMetadata->replaceResources(
            [CswOnlineResourceType::Layer, CswOnlineResourceType::Style, CswOnlineResourceType::Capabilities],
            [
                ...$this->getMetadataLayers($datastoreId, $services),
                ...$this->getStyleFiles($datastoreId, $services->configurationsById),
                ...$this->getCapabilitiesFiles($datastoreId, $services),
            ],
        );
    }

    /**
     * @return list<CswOnlineResource>
     */
    private function getMetadataLayers(string $datastoreId, DatasheetServices $services): array
    {
        $layers = [];

        foreach ($services->configurationsById as $configuration) {
            $offering = $services->offeringOfConfiguration($configuration['_id']);
            if (null === $offering) {
                continue;
            }

            $serviceEndpoint = $this->datastoreApiService->getEndpoint($datastoreId, $offering['endpoint']['_id']);

            switch ($configuration['type']) {
                case ConfigurationTypes::WFS:
                    $endpointUrl = $serviceEndpoint['endpoint']['urls'][0]['url'];
                    $subLayers = $this->getWfsSubLayers($configuration, $offering, $endpointUrl);
                    $layers = array_merge($layers, $subLayers);

                    break;

                case ConfigurationTypes::WMSRASTER:
                case ConfigurationTypes::WMSVECTOR:
                    $layerName = $offering['layer_name'];
                    $gmdOnlineResourceProtocol = 'OGC:WMS';
                    $endpointUrl = $serviceEndpoint['endpoint']['urls'][0]['url'];

                    $layers[] = CswOnlineResource::layer($layerName, $gmdOnlineResourceProtocol, $this->cleanLayerUrl($endpointUrl), $offering['open']);
                    break;

                case ConfigurationTypes::WMTSTMS:
                    $layerName = $offering['layer_name'];

                    if (!isset($configuration['type_infos']['used_data'][0]['stored_data'])) {
                        break;
                    }
                    $pyramid = $this->storedDataApiService->get($datastoreId, $configuration['type_infos']['used_data'][0]['stored_data'])->array();

                    $gmdOnlineResourceProtocol = null;
                    $actualType = null;

                    if (StoredDataTypes::ROK4_PYRAMID_VECTOR === $pyramid['type']) {
                        $gmdOnlineResourceProtocol = 'TMS';
                        $actualType = 'TMS';
                    } elseif (StoredDataTypes::ROK4_PYRAMID_RASTER === $pyramid['type']) {
                        $gmdOnlineResourceProtocol = 'OGC:WMTS';
                        $actualType = 'WMTS';
                    }
                    if (null === $gmdOnlineResourceProtocol) {
                        break;
                    }

                    $endpoints = array_filter($serviceEndpoint['endpoint']['urls'], fn (array $url) => $actualType === $url['type']);
                    $endpoints = array_values($endpoints);

                    if (count($endpoints) > 0) {
                        $endpointUrl = $endpoints[0]['url'];
                        if ('TMS' === $actualType) {
                            $endpointUrl .= '/1.0.0';
                            // la version 1.0.0 du TMS est aussi écrite en dur
                            // dans le composant UserKeyLink pour créer une URL de 'capabilities'
                        }
                        $layers[] = CswOnlineResource::layer($layerName, $gmdOnlineResourceProtocol, $this->cleanLayerUrl($endpointUrl), $offering['open']);
                    }

                    break;
            }
        }

        return $layers;
    }

    /**
     * @param array<mixed> $configuration configuration détaillée (type_infos)
     * @param array<mixed> $offering
     *
     * @return list<CswOnlineResource>
     */
    private function getWfsSubLayers(array $configuration, array $offering, string $serviceEndpointUrl): array
    {
        $configRelations = $configuration['type_infos']['used_data'][0]['relations'];

        return array_values(array_map(function ($relation) use ($offering, $serviceEndpointUrl) {
            $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['native_name']);
            $gmdOnlineResourceProtocol = 'OGC:WFS';

            return CswOnlineResource::layer($layerName, $gmdOnlineResourceProtocol, $this->cleanLayerUrl($serviceEndpointUrl), $offering['open']);
        }, $configRelations));
    }

    /**
     * Supprime doublons de "/" dans l'url. Préserve la partie protocole.
     */
    private function cleanLayerUrl(string $url): string
    {
        return preg_replace('#(?<!:)//+#', '/', $url) ?? throw new \RuntimeException("Nettoyage de l’URL de couche impossible : $url");
    }

    /**
     * Seulement les services WFS et WMTS/WMS sont concernés par les fichiers de style.
     *
     * @param array<array<mixed>> $configurations configurations détaillées de la fiche
     *
     * @return list<CswOnlineResource>
     */
    private function getStyleFiles(string $datastoreId, array $configurations): array
    {
        $styleFiles = [];

        $configurationsList = array_filter($configurations, fn (array $configuration) => in_array($configuration['type'], [ConfigurationTypes::WFS, ConfigurationTypes::WMTSTMS], true));

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

                $styleFiles[] = CswOnlineResource::style($name, $description, $layer['url']);
            }
        }

        return $styleFiles;
    }

    /**
     * @return list<CswOnlineResource>
     */
    private function getCapabilitiesFiles(string $datastoreId, DatasheetServices $services): array
    {
        $datastore = $this->datastoreApiService->get($datastoreId);
        $datastoreName = $datastore['technical_name'];

        $publishedConfigurations = array_filter($services->configurationsById, fn (array $configuration) => ConfigurationStatuses::PUBLISHED === $configuration['status']);
        $layerTypes = array_map(fn ($config) => $config['type'], $publishedConfigurations);
        $layerTypes = array_values(array_unique($layerTypes));

        $annexeUrl = $this->parameterBag->get('annexes_url');

        $capabilitiesFiles = [];
        foreach ($layerTypes as $type) {
            $endpoint = $this->getEndpoint($datastoreId, $type);
            if (!$endpoint) {
                continue;
            }

            $technicalName = $endpoint['technical_name'];

            $annexes = $this->annexeApiService->getAll($datastoreId, null, "/$technicalName/capabilities.xml")->resolve();
            if (1 === count($annexes)) {
                $capabilitiesFiles[] = CswOnlineResource::capabilities(
                    "GetCapabilities - $type",
                    $endpoint['name'],
                    "$annexeUrl/$datastoreName/$technicalName/capabilities.xml",
                    self::CAPABILITIES_SERVICES[$type],
                    $this->serviceUrls($services, $type),
                );
            }
        }

        return $capabilitiesFiles;
    }

    /** @var array<string, 'WFS'|'WMS'|'WMTS'> type de configuration => service OGC du GetCapabilities */
    private const CAPABILITIES_SERVICES = [
        ConfigurationTypes::WFS => 'WFS',
        ConfigurationTypes::WMSVECTOR => 'WMS',
        ConfigurationTypes::WMSRASTER => 'WMS',
        ConfigurationTypes::WMTSTMS => 'WMTS',
    ];

    /**
     * URL des offerings de ce type de configuration, où lire la version du service.
     *
     * @return list<string>
     */
    private function serviceUrls(DatasheetServices $services, string $configurationType): array
    {
        $urls = [];
        foreach ($services->offeringsById as $offering) {
            if (($services->configurationOfOffering($offering['_id'])['type'] ?? null) !== $configurationType) {
                continue;
            }
            foreach ($offering['urls'] ?? [] as $url) {
                // une offering WMTS-TMS expose une URL par protocole : seule celle du WMTS compte
                if (ConfigurationTypes::WMTSTMS !== $configurationType || 'WMTS' === ($url['type'] ?? null)) {
                    $urls[] = $url['url'] ?? '';
                }
            }
        }

        return $urls;
    }

    /**
     * @param array<mixed> $documents
     *
     * @return list<CswOnlineResource>
     */
    private function toCswDocuments(array $documents): array
    {
        return array_values(array_map(fn ($doc) => CswOnlineResource::document($doc['name'], $doc['description'] ?? null, $doc['url']), $documents));
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

    /**
     * @return array<mixed>
     */
    private function getMetadataEndpoint(string $datastoreId): array
    {
        $endpointsList = $this->datastoreApiService->getEndpointsList($datastoreId, [
            'type' => 'METADATA',
            'open' => true,
        ]);
        if (0 === count($endpointsList)) {
            throw new AppException("Point d'accès (endpoint) métadonnées n'a pas été trouvé", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $endpointsList[0]['endpoint'];
    }
}
