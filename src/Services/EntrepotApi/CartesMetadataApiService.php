<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Dto\Datasheet\DatasheetMetadataDTO;
use App\Dto\Datasheet\LanguageDTO;
use App\Dto\Datasheet\ProducerDTO;
use App\Dto\Datasheet\TerritoryDTO;
use App\Entity\CswMetadata\CswCapabilitiesFile;
use App\Entity\CswMetadata\CswDocument;
use App\Entity\CswMetadata\CswHierarchyLevel;
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

        $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id'])->text();

        $cswMetadata = $this->cswMetadataHelper->fromXml($apiMetadataXml);
        $cswMetadata->layers = $this->getMetadataLayers($datastoreId, $datasheetName);
        $cswMetadata->styleFiles = $this->getStyleFiles($datastoreId, $datasheetName);
        $cswMetadata->capabilitiesFiles = $this->getCapabilitiesFiles($datastoreId, $datasheetName);
        $cswMetadata->revisionDate = (new \DateTimeImmutable())->format('Y-m-d');

        $xmlFilePath = $this->cswMetadataHelper->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);

        // dépublie la metadata (sans la supprimer) s'il n'y a plus de services publiés
        if (0 === count($cswMetadata->layers) && isset($apiMetadata['endpoints'][0]['_id'])) {
            $this->metadataApiService->unpublish($datastoreId, $cswMetadata->fileIdentifier, $apiMetadata['endpoints'][0]['_id'])->await();
        }
    }

    public function updateStyleFiles(string $datastoreId, string $datasheetName): void
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (!$apiMetadata) {
            return;
        }

        $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id'])->text();

        $cswMetadata = $this->cswMetadataHelper->fromXml($apiMetadataXml);
        $cswMetadata->styleFiles = $this->getStyleFiles($datastoreId, $datasheetName);
        $cswMetadata->revisionDate = (new \DateTimeImmutable())->format('Y-m-d');

        $xmlFilePath = $this->cswMetadataHelper->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);
    }

    public function updateDocuments(string $datastoreId, string $datasheetName): void
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (!$apiMetadata) {
            return;
        }

        $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id'])->text();

        $cswMetadata = $this->cswMetadataHelper->fromXml($apiMetadataXml);
        $cswMetadata->documents = $this->getDatasheetDocuments($datastoreId, $datasheetName);
        $cswMetadata->revisionDate = (new \DateTimeImmutable())->format('Y-m-d');

        $xmlFilePath = $this->cswMetadataHelper->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);
    }

    /**
     * Crée ou met à jour la métadonnée depuis le DTO du formulaire fiche de données.
     *
     * @return array<mixed> apiMetadata enrichi avec la clé csw_metadata
     */
    public function createOrUpdateFromDto(string $datastoreId, string $datasheetName, DatasheetMetadataDTO $dto): array
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);

        if (null === $apiMetadata) {
            $oldCswMetadata = null;
        } else {
            $oldMetadataFileXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id'])->text();
            $oldCswMetadata = $this->cswMetadataHelper->fromXml($oldMetadataFileXml);
        }

        $newCswMetadata = $this->getNewCswMetadataFromDto($datastoreId, $datasheetName, $oldCswMetadata, $dto);

        return $this->persistCswMetadata($datastoreId, $datasheetName, $apiMetadata, $oldCswMetadata, $newCswMetadata);
    }

    /**
     * Crée ou met à jour la métadonnée liée à la fiche de données (chemin legacy via formData array).
     *
     * @param array<mixed> $formData
     */
    public function createOrUpdate(string $datastoreId, string $datasheetName, ?array $formData = null): array
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);

        if (null === $apiMetadata) {
            if (null === $formData) { // n'est pas censé arriver
                throw new AppException('formData doit être non null si création de la métadonnée', Response::HTTP_INTERNAL_SERVER_ERROR);
            }
            $oldCswMetadata = null;
        } else {
            $oldMetadataFileXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id'])->text();
            $oldCswMetadata = $this->cswMetadataHelper->fromXml($oldMetadataFileXml);
        }

        $newCswMetadata = $this->getNewCswMetadata($datastoreId, $datasheetName, $oldCswMetadata, $formData);

        return $this->persistCswMetadata($datastoreId, $datasheetName, $apiMetadata, $oldCswMetadata, $newCswMetadata);
    }

    /**
     * Construit CswMetadata depuis le DTO de formulaire validé (champ-à-champ).
     */
    private function getNewCswMetadataFromDto(string $datastoreId, string $datasheetName, ?CswMetadata $oldCswMetadata, DatasheetMetadataDTO $dto): CswMetadata
    {
        $newCswMetadata = null === $oldCswMetadata ? new CswMetadata() : clone $oldCswMetadata;

        $today = (new \DateTimeImmutable())->format('Y-m-d');

        $newCswMetadata->fileIdentifier = $dto->file_identifier;
        $newCswMetadata->hierarchyLevel = CswHierarchyLevel::tryFrom($dto->hierarchy_level) ?? CswHierarchyLevel::Dataset;
        $newCswMetadata->language = null !== $dto->language
            ? new LanguageDTO($dto->language->code, $dto->language->language)
            : new LanguageDTO('fre', 'français');
        $newCswMetadata->charset = $dto->charset;
        $newCswMetadata->name = $dto->name;
        $newCswMetadata->description = $dto->description;
        $newCswMetadata->dateCreation = $dto->date_creation;
        $newCswMetadata->themes = $dto->themes;
        $newCswMetadata->keywordsInspire = $dto->keywords_inspire;
        $newCswMetadata->keywordsAdditional = $dto->keywords_additional;
        $newCswMetadata->resourceGenealogy = $dto->resource_genealogy;
        $newCswMetadata->updateFrequency = $dto->update_frequency;
        $newCswMetadata->producers = $dto->producers;
        $newCswMetadata->resourceConstraints = $dto->resource_constraints;

        // Territoires : normalisation en TerritoryDTO à partir des données envoyées par le formulaire.
        // MapRequestPayload désérialise territories[] en tableaux associatifs (pas en TerritoryDTO).
        $newCswMetadata->territories = array_map(static fn (array $t): TerritoryDTO => new TerritoryDTO(
            id: (string) ($t['id'] ?? ''),
            title: (string) ($t['title'] ?? ''),
            bbox: $t['bbox'] ?? [],
        ), $dto->territories);

        // Couches / fichiers (vides si aucun service publié, préservés si déjà en place)
        $newCswMetadata->layers = $this->getMetadataLayers($datastoreId, $datasheetName);
        $newCswMetadata->styleFiles = $this->getStyleFiles($datastoreId, $datasheetName);
        $newCswMetadata->capabilitiesFiles = $this->getCapabilitiesFiles($datastoreId, $datasheetName);

        // Dates automatiques
        $newCswMetadata->publicationDate = null !== $oldCswMetadata ? ($oldCswMetadata->publicationDate ?? $today) : $today; // posée une fois à la création
        $newCswMetadata->revisionDate = $today; // mise à jour à chaque modification

        return $newCswMetadata;
    }

    /**
     * Construit CswMetadata depuis le formData array (chemin legacy CommonDTO).
     * Conserve la compatibilité jusqu'à la suppression de CommonDTO.
     *
     * @param ?array<mixed> $formData
     */
    private function getNewCswMetadata(string $datastoreId, string $datasheetName, ?CswMetadata $oldCswMetadata = null, ?array $formData = null): CswMetadata
    {
        if (null === $oldCswMetadata && null === $formData) {
            throw new AppException('oldCswMetadata et formData ne peuvent pas être null à la fois', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $newCswMetadata = null === $oldCswMetadata ? new CswMetadata() : clone $oldCswMetadata;

        $today = (new \DateTimeImmutable())->format('Y-m-d');
        $layers = $this->getMetadataLayers($datastoreId, $datasheetName);

        if ($formData) {
            $language = $formData['language']
                ? new LanguageDTO($formData['language']['code'], $formData['language']['language'])
                : new LanguageDTO('fre', 'français');

            $newCswMetadata->fileIdentifier = $formData['identifier'];
            $newCswMetadata->hierarchyLevel = CswHierarchyLevel::tryFrom('' === $formData['hierarchy_level'] ? 'dataset' : $formData['hierarchy_level']);
            $newCswMetadata->language = $language;
            $newCswMetadata->charset = $formData['charset'];
            $newCswMetadata->name = $formData['public_name'];
            $newCswMetadata->description = $formData['description'];
            $newCswMetadata->dateCreation = $formData['creation_date'];
            $newCswMetadata->themes = $formData['category'] ?? [];
            $newCswMetadata->keywordsInspire = $formData['keywords'] ?? [];
            $newCswMetadata->keywordsAdditional = $formData['free_keywords'] ?? [];
            $newCswMetadata->resourceGenealogy = $formData['resource_genealogy'];
            $newCswMetadata->resolution = $formData['resolution'] ?? null;
            $newCswMetadata->updateFrequency = $formData['frequency_code'] ?? null;

            // Encapsule l'unique organisation legacy dans un ProducerDTO pointOfContact
            $newCswMetadata->producers = [
                new ProducerDTO(
                    organization_name: $formData['organization'] ?? '',
                    organization_email: $formData['organization_email'] ?? '',
                    role: 'pointOfContact',
                ),
            ];

            // Chemin legacy : pas de territoires sélectionnés dans le formulaire, on crée un territoire
            // synthétique « France » depuis la bbox calculée sur les stored_data.
            if (empty($newCswMetadata->territories)) {
                $legacyBbox = $this->getBbox($datastoreId, $datasheetName);
                if (!empty($legacyBbox)) {
                    $newCswMetadata->territories = [
                        new TerritoryDTO(
                            id: 'FXX',
                            title: 'France',
                            bbox: [
                                $legacyBbox['west'],
                                $legacyBbox['south'],
                                $legacyBbox['east'],
                                $legacyBbox['north'],
                            ],
                        ),
                    ];
                }
            }

            $newCswMetadata->layers = $layers;
            $newCswMetadata->styleFiles = $this->getStyleFiles($datastoreId, $datasheetName);
            $newCswMetadata->capabilitiesFiles = $this->getCapabilitiesFiles($datastoreId, $datasheetName);

            // Dates automatiques
            $newCswMetadata->publicationDate = null !== $oldCswMetadata ? ($oldCswMetadata->publicationDate ?? $today) : $today;
            $newCswMetadata->revisionDate = $today;
        }

        return $newCswMetadata;
    }

    /**
     * Persiste un CswMetadata déjà construit : sauvegarde fichier, add/replaceFile, tags, publication.
     * Gère également le changement de fileIdentifier (delete + recréation).
     *
     * @param ?array<mixed> $oldApiMetadata
     *
     * @return array<mixed> apiMetadata enrichi avec la clé csw_metadata
     */
    private function persistCswMetadata(string $datastoreId, string $datasheetName, ?array $oldApiMetadata, ?CswMetadata $oldCswMetadata, CswMetadata $newCswMetadata): array
    {
        $metadataEndpoint = $this->getMetadataEndpoint($datastoreId);

        // Vignette
        $thumbnailUrl = $this->getThumbnailUrl($datastoreId, $datasheetName);
        $newCswMetadata->thumbnailUrl = $thumbnailUrl;

        $newMetadataFilePath = $this->cswMetadataHelper->saveToFile($newCswMetadata);

        if (null === $oldApiMetadata) {
            // Création
            $newApiMetadata = $this->metadataApiService->add($datastoreId, $newMetadataFilePath);
            $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ])->array();
            $this->metadataApiService->publish($datastoreId, $newCswMetadata->fileIdentifier, $metadataEndpoint['_id'])->await();
        } elseif ($oldCswMetadata?->fileIdentifier !== $newCswMetadata->fileIdentifier) {
            // Changement d'identifiant → suppression + recréation
            $this->metadataApiService->unpublish($datastoreId, $oldCswMetadata->fileIdentifier, $metadataEndpoint['_id'])->await();
            $this->metadataApiService->delete($datastoreId, $oldApiMetadata['_id'])->await();

            $newApiMetadata = $this->metadataApiService->add($datastoreId, $newMetadataFilePath);
            $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], $oldApiMetadata['tags'])->array();
            $this->metadataApiService->publish($datastoreId, $newCswMetadata->fileIdentifier, $metadataEndpoint['_id'])->await();
        } else {
            // Mise à jour simple
            $newApiMetadata = $this->metadataApiService->replaceFile($datastoreId, $oldApiMetadata['_id'], $newMetadataFilePath);
            $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], $oldApiMetadata['tags'])->array();

            if (0 === count($newApiMetadata['endpoints'])) { // pas encore publiée
                $this->metadataApiService->publish($datastoreId, $newCswMetadata->fileIdentifier, $metadataEndpoint['_id'])->await();
            }
        }

        $newApiMetadata['csw_metadata'] = $newCswMetadata;

        return $newApiMetadata;
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
        ])->resolve();

        $layers = [];

        foreach ($configurationsList as $configuration) {
            $configurationOfferings = $this->configurationApiService->getConfigurationOfferings($datastoreId, $configuration['_id'])->resolve();

            if (count($configurationOfferings) > 0) {
                $offering = $configurationOfferings[0];
                $offering = $this->configurationApiService->getOffering($datastoreId, $offering['_id'])->array();

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

                        $layers[] = new CswMetadataLayer($layerName, $gmdOnlineResourceProtocol, $this->cleanLayerUrl($endpointUrl), $offering['_id'], $offering['open']);
                        break;

                    case ConfigurationTypes::WMTSTMS:
                        $layerName = $offering['layer_name'];
                        $configuration = $this->configurationApiService->get($datastoreId, $configuration['_id'])->array();

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

                        $endpoints = array_filter($serviceEndpoint['endpoint']['urls'], fn (array $url) => $actualType === $url['type']);
                        $endpoints = array_values($endpoints);

                        if (count($endpoints) > 0) {
                            $endpointUrl = $endpoints[0]['url'];
                            if ('TMS' === $actualType) {
                                $endpointUrl = $endpointUrl.'/1.0.0';
                                // la version 1.0.0 du TMS est aussi écrite en dur
                                // dans le composant UserKeyLink pour créer une URL de 'capabilities'
                            }
                            $layers[] = new CswMetadataLayer($layerName, $gmdOnlineResourceProtocol, $this->cleanLayerUrl($endpointUrl), $offering['_id'], $offering['open']);
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
        $configuration = $this->configurationApiService->get($datastoreId, $configuration['_id'])->array();
        $configRelations = $configuration['type_infos']['used_data'][0]['relations'];

        $relationLayers = array_map(function ($relation) use ($offering, $serviceEndpointUrl) {
            $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['native_name']);
            $gmdOnlineResourceProtocol = 'OGC:WFS';

            return new CswMetadataLayer($layerName, $gmdOnlineResourceProtocol, $this->cleanLayerUrl($serviceEndpointUrl), $offering['_id'], $offering['open']);
        }, $configRelations);

        return $relationLayers;
    }

    /**
     * Supprime doublons de "/" dans l'url. Préserve la partie protocole.
     */
    private function cleanLayerUrl(string $url): string
    {
        return preg_replace('#(?<!:)//+#', '/', $url);
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
        ])->resolve();
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

            $annexes = $this->annexeApiService->getAll($datastoreId, null, "/$technicalName/capabilities.xml")->resolve();
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

        $annexeList = $this->annexeApiService->getAll($datastoreId, null, null, $labels)->resolve();

        // retourne l'annexe s'il existe
        if (0 === count($annexeList)) {
            return [];
        }

        $docsListJson = $this->annexeApiService->download($datastoreId, $annexeList[0]['_id'])->text();
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

    /**
     * Calcule la bbox depuis les stored_data (chemin legacy sans territoires).
     *
     * @return array<string,float>
     */
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
