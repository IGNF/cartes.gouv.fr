<?php

declare(strict_types=1);

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Dto\Datasheet\DatasheetMetadataDTO;
use App\Dto\Datasheet\DatasheetServices;
use App\Dto\Metadata\CswMetadata;
use App\Dto\Metadata\CswOnlineResource;
use App\Dto\Metadata\CswOnlineResourceType;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Services\CswMetadataXmlReader;
use App\Services\CswMetadataXmlWriter;
use App\Services\DatasheetMetadataMapper;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Uid\Uuid;

/**
 * Fiche de métadonnées d’une fiche de données : le formulaire écrit les champs saisis, les flux et documents ne rafraîchissent que les ressources en ligne.
 *
 * Seules publish() et unpublish(), actions explicites de l’utilisateur, changent l’état de publication de la fiche de métadonnées.
 */
class CartesMetadataApiService
{
    private const THUMBNAIL_LABEL = 'type=thumbnail';

    public function __construct(
        private readonly ParameterBagInterface $parameterBag,
        private readonly DatastoreApiService $datastoreApiService,
        private readonly AnnexeApiService $annexeApiService,
        private readonly MetadataApiService $metadataApiService,
        private readonly CswMetadataXmlReader $cswMetadataReader,
        private readonly CswMetadataXmlWriter $cswMetadataWriter,
        private readonly CartesStylesApiService $cartesStylesApiService,
        private readonly StoredDataApiService $storedDataApiService,
        private readonly UploadApiService $uploadApiService,
        private readonly DatasheetMetadataMapper $mapper,
        private readonly LoggerInterface $logger,
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

    /**
     * Sans effet si la fiche de métadonnées est déjà publiée.
     *
     * @return list<array<mixed>> points d’accès de publication après l’opération (la relecture de l’Entrepôt peut être en retard)
     */
    public function publish(string $datastoreId, string $datasheetName): array
    {
        $apiMetadata = $this->requireMetadata($datastoreId, $datasheetName);
        if ([] !== ($apiMetadata['endpoints'] ?? [])) {
            return $apiMetadata['endpoints'];
        }

        $endpoints = $this->datastoreApiService->getEndpointsList($datastoreId, ['type' => 'METADATA', 'open' => true]);
        if ([] === $endpoints) {
            throw new AppException('Aucun point d’accès de métadonnées ouvert sur cet entrepôt', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $this->metadataApiService->publish($datastoreId, $apiMetadata['file_identifier'], $endpoints[0]['endpoint']['_id'])->await();

        return [$endpoints[0]['endpoint']];
    }

    // dépublie de tous les points d’accès ; sans effet si elle n’est pas publiée
    public function unpublish(string $datastoreId, string $datasheetName): void
    {
        $apiMetadata = $this->requireMetadata($datastoreId, $datasheetName);

        foreach ($apiMetadata['endpoints'] ?? [] as $endpoint) {
            $this->metadataApiService->unpublish($datastoreId, $apiMetadata['file_identifier'], $endpoint['_id'])->await();
        }
    }

    // l’Entrepôt répond 204 si l’identifiant est libre, 409 s’il est pris
    public function isFileIdentifierAvailable(string $datastoreId, string $fileIdentifier): bool
    {
        try {
            $this->metadataApiService->checkFileIdentifier($datastoreId, $fileIdentifier)->await();

            return true;
        } catch (ApiException $e) {
            if (Response::HTTP_CONFLICT === $e->getStatusCode()) {
                return false;
            }
            throw $e;
        }
    }

    /**
     * Crée la fiche de données par sa fiche de métadonnées, non publiée ; la vignette est déposée d’abord et supprimée si l’écriture échoue.
     *
     * @return array<mixed> métadonnée de l’Entrepôt, avec `csw_metadata`
     *
     * @throws AppException 409 si le nom ou l’identifiant de fichier est déjà pris
     */
    public function create(string $datastoreId, DatasheetMetadataDTO $dto, ?UploadedFile $thumbnail): array
    {
        if ($this->datasheetExists($datastoreId, $dto->name)) {
            throw new AppException(sprintf('La fiche de données « %s » existe déjà', $dto->name), Response::HTTP_CONFLICT, ['field' => 'name']);
        }

        return $this->createMetadata($datastoreId, $dto->name, $this->mapper->map($dto), $thumbnail);
    }

    /**
     * Remplace les champs saisis ; crée la fiche de métadonnées si elle manque, avec les ressources en ligne des flux existants.
     *
     * @param \Closure(): DatasheetServices $loadServices appelée seulement si la fiche de métadonnées manque
     *
     * @return array<mixed> métadonnée de l’Entrepôt, avec `csw_metadata`
     *
     * @throws AppException 404 si la fiche de données n’existe pas, 400 si l’identifiant change, 409 si l’identifiant est pris
     */
    public function replace(string $datastoreId, string $datasheetName, DatasheetMetadataDTO $dto, \Closure $loadServices, ?UploadedFile $thumbnail, bool $deleteThumbnail): array
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (null === $apiMetadata) {
            if (!$this->datasheetExists($datastoreId, $datasheetName)) {
                throw new AppException(sprintf('La fiche de données « %s » n’existe pas', $datasheetName), Response::HTTP_NOT_FOUND);
            }

            $metadata = $this->mapper->map($dto);
            $this->replaceServiceResources($metadata, $datastoreId, $loadServices());

            // vignette déjà déposée depuis l’en-tête de la fiche : gardée, remplacée ou supprimée comme pour une fiche existante
            $oldThumbnails = $this->thumbnailAnnexes($datastoreId, $datasheetName);
            if (!$thumbnail instanceof UploadedFile && !$deleteThumbnail && [] !== $oldThumbnails) {
                $metadata->thumbnail_url = $this->annexeApiService->getAbsoluteUrl($datastoreId, $oldThumbnails[0]);
            }

            $apiMetadata = $this->createMetadata($datastoreId, $datasheetName, $metadata, $thumbnail);
            if ($thumbnail instanceof UploadedFile || $deleteThumbnail) {
                $this->removeAnnexes($datastoreId, $oldThumbnails);
            }

            return $apiMetadata;
        }

        $existing = $this->readMetadata($datastoreId, $apiMetadata);
        if (null !== $existing->file_identifier && $existing->file_identifier !== $dto->file_identifier) {
            throw new AppException('L’identifiant de fichier ne peut pas être modifié', Response::HTTP_BAD_REQUEST, ['field' => 'file_identifier']);
        }

        $metadata = $this->mapper->map($dto, $existing);
        $oldThumbnails = $thumbnail instanceof UploadedFile || $deleteThumbnail ? $this->thumbnailAnnexes($datastoreId, $datasheetName) : [];
        if ($deleteThumbnail) {
            $metadata->thumbnail_url = null;
        }

        $newThumbnail = null;
        if ($thumbnail instanceof UploadedFile) {
            $newThumbnail = $this->addThumbnail($datastoreId, $datasheetName, $thumbnail);
            $metadata->thumbnail_url = $this->annexeApiService->getAbsoluteUrl($datastoreId, $newThumbnail);
        }

        $apiMetadata = $this->withThumbnailRollback($datastoreId, $newThumbnail, fn () => $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $this->cswMetadataWriter->saveToFile($metadata)));
        $this->removeAnnexes($datastoreId, $oldThumbnails);

        $apiMetadata['csw_metadata'] = $metadata;

        return $apiMetadata;
    }

    /**
     * Couches, styles et GetCapabilities rebâtis depuis les flux de la fiche ; rien si la fiche n’a pas de fiche de métadonnées.
     */
    public function refreshOnlineResources(string $datastoreId, string $datasheetName, DatasheetServices $services): void
    {
        $updated = $this->rewrite($datastoreId, $datasheetName, fn (CswMetadata $metadata) => $this->replaceServiceResources($metadata, $datastoreId, $services));

        if (!$updated) {
            $this->logger->info('Fiche {datasheetName} sans fiche de métadonnées : ressources en ligne non mises à jour', ['datasheetName' => $datasheetName]);
        }
    }

    /**
     * @param array<array<mixed>> $configurations configurations détaillées de la fiche
     */
    public function updateStyleFiles(string $datastoreId, string $datasheetName, array $configurations): void
    {
        $this->rewrite($datastoreId, $datasheetName, fn (CswMetadata $metadata) => $metadata->replaceResources([CswOnlineResourceType::Style], $this->getStyleFiles($datastoreId, $configurations)));
    }

    /**
     * @param array<mixed> $documents liste de documents de la fiche, déjà en main chez l'appelant
     */
    public function updateDocuments(string $datastoreId, string $datasheetName, array $documents): void
    {
        $this->rewrite($datastoreId, $datasheetName, fn (CswMetadata $metadata) => $metadata->replaceResources([CswOnlineResourceType::Document], $this->toCswDocuments($documents)));
    }

    /**
     * Seul chemin de modification d’une fiche existante : téléchargement, lecture, modification, écriture.
     *
     * @param \Closure(CswMetadata): void $modify
     *
     * @return bool false si la fiche n’a pas de fiche de métadonnées
     */
    private function rewrite(string $datastoreId, string $datasheetName, \Closure $modify): bool
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (null === $apiMetadata) {
            return false;
        }

        $metadata = $this->readMetadata($datastoreId, $apiMetadata);
        $modify($metadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $this->cswMetadataWriter->saveToFile($metadata));

        return true;
    }

    /**
     * @param array<mixed> $apiMetadata
     */
    private function readMetadata(string $datastoreId, array $apiMetadata): CswMetadata
    {
        return $this->cswMetadataReader->read($this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id'])->text());
    }

    /**
     * @return array<mixed>
     */
    private function createMetadata(string $datastoreId, string $datasheetName, CswMetadata $metadata, ?UploadedFile $thumbnail): array
    {
        $fileIdentifier = $metadata->requireFileIdentifier();
        if (!$this->isFileIdentifierAvailable($datastoreId, $fileIdentifier)) {
            throw new AppException(sprintf('L’identifiant de fichier « %s » est déjà utilisé', $fileIdentifier), Response::HTTP_CONFLICT, ['field' => 'file_identifier']);
        }

        $annexe = null;
        if ($thumbnail instanceof UploadedFile) {
            $annexe = $this->addThumbnail($datastoreId, $datasheetName, $thumbnail);
            $metadata->thumbnail_url = $this->annexeApiService->getAbsoluteUrl($datastoreId, $annexe);
        }

        $apiMetadata = $this->withThumbnailRollback($datastoreId, $annexe, function () use ($datastoreId, $datasheetName, $metadata) {
            $apiMetadata = $this->metadataApiService->add($datastoreId, $this->cswMetadataWriter->saveToFile($metadata));

            try {
                return $this->metadataApiService->addTags($datastoreId, $apiMetadata['_id'], [CommonTags::DATASHEET_NAME => $datasheetName])->array();
            } catch (\Throwable $e) {
                // sans étiquette, aucune fiche ne la montre et son identifiant resterait pris
                $this->metadataApiService->delete($datastoreId, $apiMetadata['_id'])->await();
                throw $e;
            }
        });
        $apiMetadata['csw_metadata'] = $metadata;

        return $apiMetadata;
    }

    // une fiche de données existe par ses livraisons, ses données stockées ou sa fiche de métadonnées
    private function datasheetExists(string $datastoreId, string $datasheetName): bool
    {
        $query = ['tags' => [CommonTags::DATASHEET_NAME => $datasheetName]];

        return [] !== $this->uploadApiService->getAll($datastoreId, [...$query, 'fields' => 'status'])->resolve()
            || [] !== $this->storedDataApiService->getAll($datastoreId, [...$query, 'fields' => 'type'])->resolve()
            || null !== $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
    }

    /**
     * @return array<mixed> annexe créée
     */
    private function addThumbnail(string $datastoreId, string $datasheetName, UploadedFile $thumbnail): array
    {
        // chemin unique : l’ancienne vignette reste en place jusqu’à l’écriture de la fiche
        $path = sprintf('thumbnail/%s.%s', Uuid::v4(), $thumbnail->guessExtension() ?? 'bin');

        return $this->annexeApiService->add($datastoreId, $thumbnail->getRealPath(), [$path], [CommonTags::DATASHEET_NAME."=$datasheetName", self::THUMBNAIL_LABEL]);
    }

    /**
     * @return list<array<mixed>>
     */
    private function thumbnailAnnexes(string $datastoreId, string $datasheetName): array
    {
        return array_values($this->annexeApiService->getAll($datastoreId, null, null, [CommonTags::DATASHEET_NAME."=$datasheetName", self::THUMBNAIL_LABEL])->resolve());
    }

    /**
     * Exécute l’écriture de la fiche ; en cas d’échec, supprime la vignette qui vient d’être déposée.
     *
     * @template T
     *
     * @param array<mixed>|null $annexe
     * @param \Closure(): T     $write
     *
     * @return T
     */
    private function withThumbnailRollback(string $datastoreId, ?array $annexe, \Closure $write): mixed
    {
        try {
            return $write();
        } catch (\Throwable $e) {
            if (null !== $annexe) {
                $this->removeAnnexes($datastoreId, [$annexe]);
            }
            throw $e;
        }
    }

    /**
     * Un échec est journalisé sans être renvoyé : la fiche est déjà écrite, l’annexe reste seulement en trop.
     *
     * @param list<array<mixed>> $annexes
     */
    private function removeAnnexes(string $datastoreId, array $annexes): void
    {
        foreach ($annexes as $annexe) {
            try {
                $this->annexeApiService->remove($datastoreId, $annexe['_id'])->await();
            } catch (\Throwable $e) {
                $this->logger->error('Suppression de l’annexe {annexeId} impossible : {error}', ['annexeId' => $annexe['_id'], 'error' => $e->getMessage(), 'exception' => $e]);
            }
        }
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
     * @return array<mixed>
     */
    private function requireMetadata(string $datastoreId, string $datasheetName): array
    {
        return $this->getMetadataByDatasheetName($datastoreId, $datasheetName)
            ?? throw new AppException("La fiche de données [$datasheetName] n’a pas de fiche de métadonnées", Response::HTTP_NOT_FOUND);
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
}
