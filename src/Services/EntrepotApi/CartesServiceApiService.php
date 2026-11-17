<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\ResponsePromise;
use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationMetadataTypes;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\OfferingStatuses;
use App\Constants\EntrepotApi\OfferingTypes;
use App\Constants\EntrepotApi\PermissionTypes;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Constants\ServiceAccess;
use App\Dto\Datasheet\DatasheetServices;
use App\Dto\Services\Form\ServiceAttributionFormDTO;
use App\Dto\Services\Form\ServiceEditFormDTO;
use App\Dto\Services\Form\ServiceFormDTO;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Services\CapabilitiesService;
use App\Services\DatastorePrefixValidator;
use App\Services\GeonetworkApiService;
use App\Services\MembershipService;
use App\Services\SandboxService;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * `Service` sur cartes.gouv.fr qui représente un `offering` et une `configuration` de l'`API Entrepôt`, ainsi que les fichiers de style (`styles`), `tms_metadata` et url de partage (`share_url`).
 */
class CartesServiceApiService
{
    // les trois attentes (offering dépubliée, offering supprimée, configuration dépubliée) sont séquentielles et doivent tenir sous max_execution_time (.docker/php.ini, 120 s)
    private const UNPUBLISH_MAX_ATTEMPTS = 6;
    private const UNPUBLISH_RETRY_DELAY_SECONDS = 5;

    private readonly HttpClientInterface $httpClient;

    public function __construct(
        private readonly ParameterBagInterface $params,
        private readonly ConfigurationApiService $configurationApiService,
        private readonly AnnexeApiService $annexeApiService,
        private readonly DatastoreApiService $datastoreApiService,
        private readonly StaticApiService $staticApiService,
        private readonly StoredDataApiService $storedDataApiService,
        private readonly CapabilitiesService $capabilitiesService,
        private readonly CartesMetadataApiService $cartesMetadataApiService,
        private readonly SandboxService $sandboxService,
        private readonly CartesStylesApiService $cartesStylesApiService,
        private readonly GeonetworkApiService $geonetworkApiService,
        private readonly MembershipService $membershipService,
        private readonly CacheInterface $cache,
        private readonly LoggerInterface $logger,
        private readonly ServiceConfigurationRequestBuilder $configurationRequestBuilder,
        private readonly ServiceImageAnnexeService $serviceImageAnnexeService,
        private readonly DatastorePrefixValidator $datastorePrefixValidator,
        HttpClientInterface $httpClient,
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $entrepotApi,
    ) {
        $this->httpClient = $httpClient->withOptions([
            'proxy' => $params->get('http_proxy'),
        ]);
    }

    /**
     * @param array<mixed>|null $offering
     * @param array<mixed>|null $configuration
     *
     * @return array<mixed>
     */
    public function getService(string $datastoreId, string $offeringId, bool $migrateStyles = true, ?array $offering = null, ?array $configuration = null): array
    {
        $offering ??= $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();

        $configuration ??= $this->configurationApiService->get($datastoreId, $offering['configuration']['_id'])->array();
        $offering['configuration'] = $configuration;

        // traitement spécial pour WMTS-TMS
        if (OfferingTypes::WMTSTMS === $offering['type']) {
            $storedData = $this->storedDataApiService->get($datastoreId, $offering['configuration']['type_infos']['used_data'][0]['stored_data'])->array();
            $offering['configuration']['pyramid'] = $storedData;

            // TMS
            if (StoredDataTypes::ROK4_PYRAMID_VECTOR === $storedData['type']) {
                // Metadata (TMS)
                $urls = array_values(array_filter($offering['urls'], static function ($url) {
                    return 'TMS' == $url['type'];
                }));
                $url = $urls[0]['url'].'/metadata.json';

                try {
                    $response = $this->httpClient->request('GET', $url);
                    if (Response::HTTP_OK === $response->getStatusCode()) {
                        $offering['tms_metadata'] = $response->toArray();
                    }
                } catch (\Throwable) {
                }
            }
        }

        $styles = [];
        if (OfferingTypes::WFS === $offering['type'] || OfferingTypes::WMTSTMS === $offering['type']) {
            $styles = $this->cartesStylesApiService->getStyles($datastoreId, $offering['configuration'], $migrateStyles);
        }
        $offering['configuration']['styles'] = $styles;

        // url de partage (url capabilities si WFS ou WMS-VECTOR, url spécifique si TMS)
        $offering['share_url'] = $this->getShareUrl($datastoreId, $offering);

        return $offering;
    }

    /**
     * @param array<string,array<mixed>> $offeringsById
     *
     * @return array<string,array<mixed>>
     */
    public function getServicesFromOfferings(string $datastoreId, array $offeringsById, bool $migrateStyles = true): array
    {
        if ([] === $offeringsById) {
            return [];
        }

        /** @var array<string,ResponsePromise> $configurationPendingByOfferingId */
        $configurationPendingByOfferingId = [];
        foreach ($offeringsById as $offeringId => $offering) {
            if (!isset($offering['configuration']['_id']) || !is_string($offering['configuration']['_id'])) {
                continue;
            }

            $configurationPendingByOfferingId[$offeringId] = $this->configurationApiService->get($datastoreId, $offering['configuration']['_id']);
        }

        /** @var array<string,array<mixed>> $configurationsByOfferingId */
        $configurationsByOfferingId = $this->entrepotApi->resolveAll($configurationPendingByOfferingId);

        foreach ($offeringsById as $offeringId => $offering) {
            $offeringsById[$offeringId] = $this->getService(
                $datastoreId,
                $offeringId,
                $migrateStyles,
                $offering,
                $configurationsByOfferingId[$offeringId] ?? null
            );
        }

        return $offeringsById;
    }

    /**
     * Configurations détaillées et offerings d'une fiche de données, en une passe (listes d'offerings lancées en parallèle).
     */
    public function getDatasheetServices(string $datastoreId, string $datasheetName): DatasheetServices
    {
        $configurations = $this->configurationApiService->getAllDetailed($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $pendingOfferingsLists = [];
        foreach ($configurations as $configuration) {
            $pendingOfferingsLists[] = $this->configurationApiService->getConfigurationOfferingsDetailed($datastoreId, $configuration['_id']);
        }

        $offeringsById = [];
        foreach ($pendingOfferingsLists as $pendingOfferings) {
            foreach ($pendingOfferings->resolve() as $offering) {
                $offeringsById[$offering['_id']] = $offering;
            }
        }

        return new DatasheetServices(array_column($configurations, null, '_id'), $offeringsById);
    }

    /**
     * @param array<mixed> $offering
     */
    public function getShareUrl(string $datastoreId, array $offering): ?string
    {
        $isSandboxDatastore = $this->sandboxService->isSandboxDatastore($datastoreId);

        $datastore = $this->datastoreApiService->get($datastoreId);
        $endpointId = $offering['endpoint']['_id'];

        $endpoint = $this->datastoreApiService->getEndpoint($datastoreId, $endpointId);

        $shareUrl = null;
        switch ($offering['type']) {
            case OfferingTypes::WFS:
            case OfferingTypes::WMSVECTOR:
            case OfferingTypes::WMSRASTER:
                if ($isSandboxDatastore) {
                    $serviceType = $this->getServiceType($offering) ?? throw new \LogicException("Type de service inconnu pour l’offre {$offering['type']}");
                    $shareUrl = $this->capabilitiesService->getGetCapUrl($endpoint['endpoint']['urls'][0]['url'], $offering['urls'][0]['url'], $serviceType);
                } else {
                    $annexeUrl = $this->params->get('annexes_url');
                    $shareUrl = implode('/', [$annexeUrl, $datastore['technical_name'],  $endpoint['endpoint']['technical_name'], 'capabilities.xml']);
                }
                break;

            case OfferingTypes::WMTSTMS:
                if (isset($offering['tms_metadata']['tiles'][0])) {
                    $shareUrl = $offering['tms_metadata']['tiles'][0];
                }

                if (isset($offering['configuration']['pyramid']['type']) && StoredDataTypes::ROK4_PYRAMID_RASTER === $offering['configuration']['pyramid']['type']) {
                    if ($isSandboxDatastore) {
                        $shareUrl = $this->capabilitiesService->getGetCapUrl($endpoint['endpoint']['urls'][0]['url'], $offering['urls'][0]['url'], 'WMTS');
                    } else {
                        $annexeUrl = $this->params->get('annexes_url');
                        $shareUrl = implode('/', [$annexeUrl, $datastore['technical_name'],  $endpoint['endpoint']['technical_name'], 'capabilities.xml']);
                    }
                }
                break;

            default:
                break;
        }

        return $shareUrl;
    }

    /**
     * Renvoie la configuration supprimée (dernier état lu avant suppression).
     *
     * @param array<mixed>|null $offering offering déjà chargée par l'appelant (avec `type` et `configuration`), évite un GET
     *
     * @return array<mixed>
     */
    public function unpublish(string $datastoreId, string $offeringId, ?array $offering = null): array
    {
        $offering ??= $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();

        return match ($offering['type']) {
            OfferingTypes::WFS, OfferingTypes::WMTSTMS, OfferingTypes::WMSVECTOR, OfferingTypes::WMSRASTER => $this->unpublishOfferingAndConfiguration($datastoreId, $offering),
            default => throw new AppException('Type de service invalide pour la suppression', Response::HTTP_BAD_REQUEST, ['offering_type' => $offering['type']]),
        };
    }

    /**
     * @param array<mixed> $offering
     *
     * @return array<mixed> la configuration supprimée
     */
    private function unpublishOfferingAndConfiguration(string $datastoreId, array $offering): array
    {
        $this->removeOfferingFully($datastoreId, $offering);

        $configuration = $this->waitForConfigurationUnpublished($datastoreId, $offering['configuration']['_id']);

        $this->removeConfiguration($datastoreId, $configuration);

        return $configuration;
    }

    /**
     * Supprime une configuration sans offre, puis ses images et fichiers de style. L’Entrepôt refuse (409) une configuration qui a encore une offre.
     *
     * @param array<mixed> $configuration
     */
    public function removeConfiguration(string $datastoreId, array $configuration): void
    {
        $this->configurationApiService->remove($datastoreId, $configuration['_id'])->await();

        // fichiers lus dans la configuration supprimée : un échec n’empêche pas la suppression du flux
        $this->removeQuietly($configuration['_id'], 'image annexes', fn () => $this->serviceImageAnnexeService->removeServiceImages($datastoreId, $configuration));
        $this->removeStyleFiles($datastoreId, $configuration);
    }

    /**
     * Suppression d’un fichier d’une configuration déjà supprimée : l’échec est journalisé, les suppressions suivantes ont lieu.
     */
    private function removeQuietly(string $configurationId, string $files, \Closure $remove): void
    {
        try {
            $remove();
        } catch (ApiException $e) {
            $this->logger->warning('{class}: Failed to remove {files} of configuration {configurationId}: {error}', [
                'class' => self::class,
                'files' => $files,
                'configurationId' => $configurationId,
                'exception' => $e,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Supprime complètement une offering : dépublication (1er DELETE) puis suppression (2e DELETE, qui la retire de ses permissions et supprime celles restées vides).
     *
     * @param array<mixed> $offering
     */
    private function removeOfferingFully(string $datastoreId, array $offering): void
    {
        // 1er DELETE : déclenche la dépublication, sauf reprise d'une tentative précédente déjà en cours ou terminée
        if (!in_array($offering['status'] ?? null, [OfferingStatuses::UNPUBLISHING, OfferingStatuses::UNPUBLISHED], true)) {
            $this->configurationApiService->removeOffering($datastoreId, $offering['_id'])->await();
        }

        $this->waitForOfferingUnpublished($datastoreId, $offering['_id']);

        // 2e DELETE : suppression définitive
        $this->configurationApiService->removeOffering($datastoreId, $offering['_id'])->await();

        $this->waitForOfferingRemoved($datastoreId, $offering['_id']);
    }

    /**
     * Attend que l'offering soit dépubliée (statut UNPUBLISHED).
     *
     * @return array<mixed> l'offering
     *
     * @throws AppException avec le statut 503 si le délai d'attente est dépassé
     */
    public function waitForOfferingUnpublished(string $datastoreId, string $offeringId): array
    {
        $offering = null;
        for ($attempt = 1; $attempt <= self::UNPUBLISH_MAX_ATTEMPTS; ++$attempt) {
            $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();
            if (OfferingStatuses::UNPUBLISHED === $offering['status']) {
                return $offering;
            }

            // statut terminal : la dépublication a échoué, inutile d'attendre davantage
            if (OfferingStatuses::UNSTABLE === $offering['status']) {
                $this->logger->warning('{class}: Offering {offeringId} became UNSTABLE while waiting for its unpublication', [
                    'class' => self::class,
                    'offeringId' => $offeringId,
                ]);

                throw new AppException('La dépublication du service a échoué', Response::HTTP_INTERNAL_SERVER_ERROR, ['offering_id' => $offeringId, 'status' => $offering['status']]);
            }

            if ($attempt < self::UNPUBLISH_MAX_ATTEMPTS) {
                sleep(self::UNPUBLISH_RETRY_DELAY_SECONDS);
            }
        }

        $timeoutSeconds = self::UNPUBLISH_MAX_ATTEMPTS * self::UNPUBLISH_RETRY_DELAY_SECONDS;
        $this->logger->warning('{class}: Timeout waiting for offering {offeringId} to reach UNPUBLISHED status (last status: {status})', [
            'class' => self::class,
            'offeringId' => $offeringId,
            'status' => $offering['status'],
            'timeout' => $timeoutSeconds,
        ]);

        throw new AppException('La dépublication du service prend trop de temps, veuillez réessayer', Response::HTTP_SERVICE_UNAVAILABLE, ['offering_id' => $offeringId, 'status' => $offering['status'], 'timeout' => $timeoutSeconds], headers: ['Retry-After' => (string) self::UNPUBLISH_RETRY_DELAY_SECONDS]);
    }

    /**
     * Attend que l'offering soit effectivement supprimée (GET renvoie 404) après le 2e DELETE.
     *
     * @throws AppException avec le statut 503 si le délai d'attente est dépassé
     */
    private function waitForOfferingRemoved(string $datastoreId, string $offeringId): void
    {
        for ($attempt = 1; $attempt <= self::UNPUBLISH_MAX_ATTEMPTS; ++$attempt) {
            try {
                $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();
            } catch (ApiException $e) {
                if (Response::HTTP_NOT_FOUND === $e->getStatusCode()) {
                    return;
                }

                throw $e;
            }

            if ($attempt < self::UNPUBLISH_MAX_ATTEMPTS) {
                sleep(self::UNPUBLISH_RETRY_DELAY_SECONDS);
            }
        }

        $timeoutSeconds = self::UNPUBLISH_MAX_ATTEMPTS * self::UNPUBLISH_RETRY_DELAY_SECONDS;
        $this->logger->warning('{class}: Timeout waiting for offering {offeringId} to be actually removed after the 2nd DELETE', [
            'class' => self::class,
            'offeringId' => $offeringId,
            'timeout' => $timeoutSeconds,
        ]);

        throw new AppException('La suppression du service prend trop de temps, veuillez réessayer', Response::HTTP_SERVICE_UNAVAILABLE, ['offering_id' => $offeringId, 'timeout' => $timeoutSeconds], headers: ['Retry-After' => (string) self::UNPUBLISH_RETRY_DELAY_SECONDS]);
    }

    /**
     * Attend que la configuration soit dépubliée (statut UNPUBLISHED), condition pour pouvoir la supprimer.
     *
     * @return array<mixed> la configuration
     *
     * @throws AppException avec le statut 503 si le délai d'attente est dépassé
     */
    public function waitForConfigurationUnpublished(string $datastoreId, string $configurationId): array
    {
        $configuration = null;
        for ($attempt = 1; $attempt <= self::UNPUBLISH_MAX_ATTEMPTS; ++$attempt) {
            $configuration = $this->configurationApiService->get($datastoreId, $configurationId)->array();
            if (ConfigurationStatuses::UNPUBLISHED === $configuration['status']) {
                return $configuration;
            }

            if ($attempt < self::UNPUBLISH_MAX_ATTEMPTS) {
                sleep(self::UNPUBLISH_RETRY_DELAY_SECONDS);
            }
        }

        $timeoutSeconds = self::UNPUBLISH_MAX_ATTEMPTS * self::UNPUBLISH_RETRY_DELAY_SECONDS;
        $this->logger->warning('{class}: Timeout waiting for configuration {configurationId} to reach UNPUBLISHED status before removal', [
            'class' => self::class,
            'configurationId' => $configurationId,
            'status' => $configuration['status'],
            'timeout' => $timeoutSeconds,
        ]);

        throw new AppException('La suppression du service prend trop de temps, veuillez réessayer', Response::HTTP_SERVICE_UNAVAILABLE, ['configuration_id' => $configurationId, 'status' => $configuration['status'], 'timeout' => $timeoutSeconds], headers: ['Retry-After' => (string) self::UNPUBLISH_RETRY_DELAY_SECONDS]);
    }

    /**
     * Suppression des styles (les fichiers annexes et statiques) liés à une configuration.
     *
     * @param array<mixed> $configuration
     */
    private function removeStyleFiles(string $datastoreId, array $configuration): void
    {
        $configurationId = $configuration['_id'];
        $remove = fn (string $files, ResponsePromise $promise) => $this->removeQuietly($configurationId, $files, fn () => $promise->await());

        // WFS et TMS ; sans migration : elle écrirait dans la configuration déjà supprimée
        $styles = [];
        $this->removeQuietly($configurationId, 'style list', function () use ($datastoreId, $configuration, &$styles): void {
            $styles = $this->cartesStylesApiService->getStyles($datastoreId, $configuration, false);
        });
        foreach ($styles as $style) {
            foreach ($style['layers'] ?? [] as $layer) {
                $remove('style annexe '.$layer['annexe_id'], $this->annexeApiService->remove($datastoreId, $layer['annexe_id']));
            }
        }

        // ancienne annexe de styles, que la migration supprimait
        $legacyAnnexes = [];
        $this->removeQuietly($configurationId, 'legacy styles annexe', function () use ($datastoreId, $configurationId, &$legacyAnnexes): void {
            $legacyAnnexes = $this->annexeApiService->getAll($datastoreId, null, "/configuration/$configurationId/styles.json")->resolve();
        });
        foreach ($legacyAnnexes as $annexe) {
            $remove('legacy styles annexe '.$annexe['_id'], $this->annexeApiService->remove($datastoreId, $annexe['_id']));
        }

        // WMS-VECTOR
        foreach ($configuration['type_infos']['used_data'][0]['relations'] ?? [] as $relation) {
            if (isset($relation['style'])) {
                $remove('style static '.$relation['style'], $this->staticApiService->delete($datastoreId, $relation['style']));
            }
        }

        // WMS-RASTER & WMTS
        foreach ($configuration['type_infos']['styles'] ?? [] as $styleStaticId) {
            $remove('style static '.$styleStaticId, $this->staticApiService->delete($datastoreId, $styleStaticId));
        }
    }

    /**
     * Publie un flux depuis le nouveau formulaire : annexes images, configuration, offre, permissions, capabilities,
     * puis ressources en ligne de la fiche de métadonnées. La métadonnée doit exister : elle fournit les liens `metadata` de la configuration.
     *
     * @param array<mixed>            $typeInfos
     * @param ?\Closure(string): void $onConfigurationCreated appelé avec l’identifiant de la configuration juste après sa création ; un échec annule la configuration
     * @param ?\Closure(): void       $onRollback             appelé quand la publication échoue avant la création de l’offre ; ne doit pas lever d’exception
     *
     * @return array<mixed> offre créée, avec sa configuration
     */
    public function publishFromForm(
        string $datastoreId,
        string $storedDataId,
        ServiceFormDTO $dto,
        string $type,
        array $typeInfos,
        ?UploadedFile $thumbnail = null,
        ?UploadedFile $attributionLogo = null,
        ?\Closure $onConfigurationCreated = null,
        ?\Closure $onRollback = null,
    ): array {
        $thumbnailUrl = null;
        $logo = null;
        try {
            // dans le try : un refus annule aussi ce que l’appelant a déjà déposé
            $this->datastorePrefixValidator->assertLayerName($datastoreId, $dto->technical_name);
            $storedData = $this->storedDataApiService->get($datastoreId, $storedDataId)->array();
            $datasheetName = $storedData['tags'][CommonTags::DATASHEET_NAME] ?? null;
            if (!is_string($datasheetName)) {
                throw new AppException('La donnée n’est rattachée à aucune fiche de données', Response::HTTP_BAD_REQUEST);
            }

            $apiMetadata = $this->cartesMetadataApiService->getMetadataByDatasheetName($datastoreId, $datasheetName);
            if (null === $apiMetadata) {
                throw new AppException('Renseignez d’abord la description de la fiche de données', Response::HTTP_BAD_REQUEST);
            }

            $endpoint = $this->getEndpointByAccess($datastoreId, $type, $dto->access);

            $configTags = [
                CommonTags::DATASHEET_NAME => $datasheetName,
                CommonTags::THEME_CATEGORIES => implode(', ', $dto->themes),
            ];

            // dépôts dans le try : un échec du second ne doit pas laisser le premier orphelin
            $thumbnailUrl = $thumbnail instanceof UploadedFile ? $this->serviceImageAnnexeService->addThumbnail($datastoreId, $datasheetName, $thumbnail) : null;
            $logo = $attributionLogo instanceof UploadedFile && $dto->attribution instanceof ServiceAttributionFormDTO
                ? $this->serviceImageAnnexeService->addAttributionLogo($datastoreId, $datasheetName, $attributionLogo)
                : null;

            $configRequestBody = $this->configurationRequestBuilder->build($dto, $type, $typeInfos, $this->getNewConfigMetadata($apiMetadata['file_identifier']), $logo);

            $configuration = $this->configurationApiService->add($datastoreId, $configRequestBody)->array();
            try {
                if ($onConfigurationCreated instanceof \Closure) {
                    $onConfigurationCreated($configuration['_id']);
                }
                $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], $configTags)->array();
                if (null !== $thumbnailUrl) {
                    $configuration = $this->configurationApiService->modify($datastoreId, $configuration['_id'], ServiceConfigurationRequestBuilder::buildThumbnailExtra($thumbnailUrl), $configuration)->array();
                }
                $offering = $this->configurationApiService->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open'])->array();
            } catch (\Throwable $th) {
                // l’échec de l’annulation est journalisé : l’erreur d’origine reste celle renvoyée
                try {
                    $this->configurationApiService->remove($datastoreId, $configuration['_id'])->await();
                } catch (\Throwable $e) {
                    $this->logger->warning('{class}: Failed to remove configuration {configurationId} after a failed publication: {error}', [
                        'class' => self::class,
                        'configurationId' => $configuration['_id'],
                        'exception' => $e,
                        'error' => $e->getMessage(),
                    ]);
                }
                throw $th;
            }
        } catch (\Throwable $th) {
            if ($onRollback instanceof \Closure) {
                $onRollback();
            }
            $this->removeImageAnnexesQuietly($datastoreId, [$thumbnailUrl, $logo['url'] ?? null]);
            throw $th;
        }

        $offering['configuration'] = $configuration;

        // shortcut: aucune annulation si les permissions ou la métadonnée échouent après la création de l’offre, à reprendre si ces échecs laissent des flux à moitié publiés
        $this->handleAccessPermissions($datastoreId, $offering, $dto->access);
        $this->createOrUpdateCapabilities($datastoreId, $endpoint, $offering);

        $this->cartesMetadataApiService->refreshOnlineResources($datastoreId, $datasheetName, $this->getDatasheetServices($datastoreId, $datasheetName));

        return $offering;
    }

    /**
     * Flux modifiable : configuration et offre publiées, rattachées à une fiche de données.
     *
     * @param array<mixed> $offering
     * @param array<mixed> $configuration
     *
     * @return string nom de la fiche de données
     *
     * @throws AppException 409 si la configuration ou l’offre n’est pas publiée, 400 sans fiche de données
     */
    public function assertEditable(array $offering, array $configuration): string
    {
        if (ConfigurationStatuses::PUBLISHED !== ($configuration['status'] ?? null) || OfferingStatuses::PUBLISHED !== ($offering['status'] ?? null)) {
            throw new AppException('Le flux est en cours de publication ou de modification, réessayez plus tard', Response::HTTP_CONFLICT, ['configuration_status' => $configuration['status'] ?? null, 'offering_status' => $offering['status'] ?? null]);
        }
        $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME] ?? null;
        if (!is_string($datasheetName)) {
            throw new AppException('Le flux n’est rattaché à aucune fiche de données', Response::HTTP_BAD_REQUEST);
        }

        return $datasheetName;
    }

    /**
     * Modifie un flux WFS, WMS vecteur, WMS raster, WMTS ou TMS ; public ↔ restreint supprime l’offre puis la recrée (flux sans offre si l’ajout échoue).
     *
     * @param array<mixed>          $offering      offre brute
     * @param array<mixed>          $configuration configuration brute de l’offre
     * @param array<string, string> $styleIds      WMS vecteur : fichier de style (gardé ou déposé) par table cochée
     *
     * @return array<mixed> offre (nouvelle si l’endpoint change), avec sa configuration
     *
     * @throws AppException 409 si la configuration ou l’offre n’est pas publiée, avant toute écriture (voir assertEditable)
     */
    public function editFromForm(
        string $datastoreId,
        array $offering,
        array $configuration,
        ServiceEditFormDTO $dto,
        ?UploadedFile $thumbnail = null,
        ?UploadedFile $attributionLogo = null,
        array $styleIds = [],
    ): array {
        $datasheetName = $this->assertEditable($offering, $configuration);

        $type = $configuration['type'];
        $previousAccess = $this->getServiceAccess($datastoreId, $offering);
        $previousEndpoint = $this->getEndpointByAccess($datastoreId, $type, $previousAccess);
        $endpoint = $this->getEndpointByAccess($datastoreId, $type, $dto->access);

        $oldThumbnailUrl = $configuration['extra']['_search']['url_vignette'] ?? null;
        $oldLogo = $configuration['attribution']['logo'] ?? null;
        $thumbnailUrl = null;
        $newLogo = null;
        try {
            $thumbnailUrl = $thumbnail instanceof UploadedFile ? $this->serviceImageAnnexeService->addThumbnail($datastoreId, $datasheetName, $thumbnail) : null;
            $newLogo = $attributionLogo instanceof UploadedFile && $dto->attribution instanceof ServiceAttributionFormDTO
                ? $this->serviceImageAnnexeService->addAttributionLogo($datastoreId, $datasheetName, $attributionLogo)
                : null;

            // sans `layer_name` : figé, et l’Entrepôt l’a déjà refusé dans un PUT
            $body = [
                'name' => $dto->title,
                'type' => $type,
                'type_infos' => $this->getEditTypeInfos($configuration, $dto, $styleIds),
                'metadata' => $configuration['metadata'] ?? [],
            ];
            if ($dto->attribution instanceof ServiceAttributionFormDTO) {
                $body['attribution'] = ['title' => $dto->attribution->title, 'url' => $dto->attribution->url];
                $logo = $newLogo ?? ($dto->remove_attribution_logo ? null : $oldLogo);
                if (null !== $logo) {
                    $body['attribution']['logo'] = $logo;
                }
            }

            $configuration = $this->configurationApiService->replace($datastoreId, $configuration['_id'], $body)->array();
        } catch (\Throwable $th) {
            $this->removeImageAnnexesQuietly($datastoreId, [$thumbnailUrl, $newLogo['url'] ?? null]);
            throw $th;
        }

        try {
            $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], [CommonTags::THEME_CATEGORIES => implode(', ', $dto->themes)])->array();

            // `extra` relu après le PUT et renvoyé entier : les autres clés (styles) sont gardées
            if (null !== $thumbnailUrl || $dto->remove_thumbnail) {
                $extra = $configuration['extra'] ?? [];
                if (null !== $thumbnailUrl) {
                    $extra['_search']['url_vignette'] = $thumbnailUrl;
                } else {
                    unset($extra['_search']['url_vignette']);
                    if ([] === ($extra['_search'] ?? null)) {
                        unset($extra['_search']);
                    }
                }
                $configuration = $this->configurationApiService->replaceExtra($datastoreId, $configuration['_id'], $extra)->array();
            }
        } catch (\Throwable $th) {
            $this->removeImageAnnexesQuietly($datastoreId, [$thumbnailUrl]);
            throw $th;
        }

        $oldOffering = $offering;
        $endpointChanged = $previousAccess->isOpen() !== $dto->access->isOpen();
        if ($endpointChanged) {
            $this->removeOfferingFully($datastoreId, $oldOffering);
            $offering = $this->configurationApiService->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open'])->array();
        } else {
            $offering = $this->configurationApiService->syncOffering($datastoreId, $offering['_id'])->array();
        }
        $offering['configuration'] = $configuration;

        // accès inchangé : permissions intactes, même expirées
        if ($endpointChanged || $previousAccess !== $dto->access) {
            $this->handleAccessPermissions($datastoreId, $offering, $dto->access, renewExpired: true);
        }

        // l’ancien endpoint public perd la couche ; createOrUpdate ignore un endpoint privé
        if ($endpointChanged) {
            $this->createOrUpdateCapabilities($datastoreId, $previousEndpoint, $oldOffering);
        }
        $this->createOrUpdateCapabilities($datastoreId, $endpoint, $offering);

        $this->cartesMetadataApiService->refreshOnlineResources($datastoreId, $datasheetName, $this->getDatasheetServices($datastoreId, $datasheetName));

        $this->removeImageAnnexesQuietly($datastoreId, [
            null !== $thumbnailUrl || $dto->remove_thumbnail ? $oldThumbnailUrl : null,
            ($oldLogo['url'] ?? null) !== ($configuration['attribution']['logo']['url'] ?? null) ? $oldLogo['url'] ?? null : null,
        ]);

        return $offering;
    }

    /**
     * @param array<mixed>          $configuration
     * @param array<string, string> $styleIds
     *
     * @return array<mixed>
     */
    private function getEditTypeInfos(array $configuration, ServiceEditFormDTO $dto, array $styleIds): array
    {
        $typeInfos = $configuration['type_infos'];

        if (ConfigurationTypes::WFS === $configuration['type']) {
            $typeInfos['used_data'][0]['relations'] = ServiceConfigurationRequestBuilder::buildWfsRelations($dto->tables);

            return $typeInfos;
        }

        $typeInfos['title'] = $dto->title;
        $typeInfos['abstract'] = $dto->description;
        $typeInfos['keywords'] = $dto->themes;
        if (ConfigurationTypes::WMSVECTOR === $configuration['type']) {
            $typeInfos['used_data'][0]['relations'] = array_map(fn (string $tableName) => ['name' => $tableName, 'style' => $styleIds[$tableName]], $dto->selected_tables);
        }

        return $typeInfos;
    }

    /**
     * Accès actuel d’un flux, même règle que `offering.ts` : endpoint ouvert, sinon permission en cours pour la communauté cartes.gouv.fr.
     *
     * @param array<mixed> $offering
     */
    private function getServiceAccess(string $datastoreId, array $offering): ServiceAccess
    {
        if (true === $offering['open']) {
            return ServiceAccess::Public;
        }

        $configCommunityId = $this->params->get('config')['community_id'];
        foreach ($this->datastoreApiService->getPermissions($datastoreId)->resolve() as $permission) {
            if (($permission['beneficiary']['_id'] ?? null) === $configCommunityId
                && !$this->isPermissionExpired($permission)
                && in_array($offering['_id'], array_column($permission['offerings'] ?? [], '_id'), true)) {
                return ServiceAccess::RestrictedVisible;
            }
        }

        return ServiceAccess::Restricted;
    }

    /**
     * @param array<mixed> $permission
     */
    private function isPermissionExpired(array $permission): bool
    {
        return isset($permission['end_date']) && strtotime($permission['end_date']) <= time();
    }

    /**
     * Suppression d’annexes sans lever d’erreur (échec journalisé) : nettoyage après un échec, ou images remplacées après une modification.
     *
     * @param array<string|null> $urls
     */
    private function removeImageAnnexesQuietly(string $datastoreId, array $urls): void
    {
        foreach (array_filter($urls, is_string(...)) as $url) {
            try {
                $this->serviceImageAnnexeService->removeByUrl($datastoreId, $url);
            } catch (\Throwable $e) {
                $this->logger->warning('{class}: Failed to remove orphan annex {url}: {error}', [
                    'class' => self::class,
                    'url' => $url,
                    'exception' => $e,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Capabilities filtrées, sauf dans l’espace découverte (sandbox) ; un échec ne remet pas en cause la publication.
     *
     * @param array<mixed> $endpoint
     * @param array<mixed> $offering
     */
    private function createOrUpdateCapabilities(string $datastoreId, array $endpoint, array $offering): void
    {
        try {
            if (!$this->sandboxService->isSandboxDatastore($datastoreId)) {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            }
        } catch (\Exception $e) {
            $this->logger->warning('{class}: Failed to create or update capabilities for endpoint {endpointName} ({endpoint}) after the creation/modification of offering {offeringId}: {error}', [
                'class' => self::class,
                'endpoint' => $endpoint['_id'],
                'endpointName' => $endpoint['technical_name'],
                'offeringId' => $offering['_id'],
                'exception' => $e,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Permissions selon l’accès choisi : la communauté propre de l’entrepôt sur tout flux restreint,
     * la communauté cartes.gouv.fr seulement quand le flux reste visualisable sur Explorer les cartes.
     *
     * @param array<mixed> $offering
     * @param bool         $renewExpired une permission expirée compte comme absente : supprimée puis recréée (modification seulement)
     */
    private function handleAccessPermissions(string $datastoreId, array $offering, ServiceAccess $access, bool $renewExpired = false): void
    {
        if ($access->isOpen()) {
            return;
        }

        $permissions = $this->datastoreApiService->getPermissions($datastoreId)->resolve();

        $communityId = $this->membershipService->getDatastoreIdentity($datastoreId)->communityId;
        $configCommunityId = $this->params->get('config')['community_id'];
        if ($renewExpired) {
            // une seule fois pour les deux communautés : elles peuvent être la même (entrepôt de cartes.gouv.fr)
            $permissions = $this->removeExpiredPermissions($datastoreId, $offering, $permissions, [$communityId, $configCommunityId]);
        }

        // POST /permissions renvoie la liste des permissions créées
        $permissions = [...$permissions, ...$this->addPermissionForCommunity($datastoreId, $communityId, $offering, $permissions)];

        if ($access->allowsCartesGouvView()) {
            $this->addPermissionForCommunity($datastoreId, $configCommunityId, $offering, $permissions);
        } elseif ($communityId !== $configCommunityId) {
            // entrepôt de cartes.gouv.fr : cette permission est celle de sa propre communauté, elle reste
            $this->removeExistingConfigPermission($datastoreId, $offering, $permissions);
        }
    }

    /**
     * @return array<mixed>
     */
    private function getNewConfigMetadata(string $fileIdentifier): array
    {
        $geonetworkBaseUrl = $this->geonetworkApiService->getBaseUrl();
        $catalogueBaseUrl = (string) $this->params->get('catalogue_url');

        return [
            [
                'format' => 'application/xml',
                'url' => $geonetworkBaseUrl.$this->geonetworkApiService->getUrl($fileIdentifier),
                'type' => ConfigurationMetadataTypes::ISO19115_2003,
            ],
            [
                'format' => 'text/html',
                'url' => implode('/', [$catalogueBaseUrl, 'dataset', rawurlencode($fileIdentifier)]),
                'type' => ConfigurationMetadataTypes::OTHER,
            ],
        ];
    }

    /**
     * @param array<mixed> $offering
     * @param array<mixed> $permissions
     */
    private function removeExistingConfigPermission(string $datastoreId, array $offering, array $permissions): void
    {
        $configCommunityId = $this->params->get('config')['community_id'];

        $existingPermission = array_filter($permissions, function ($permission) use ($offering, $configCommunityId) {
            return isset($permission['offerings'])
                && in_array($offering['_id'], array_column($permission['offerings'], '_id'))
                && isset($permission['beneficiary']['_id'])
                && $permission['beneficiary']['_id'] === $configCommunityId;
        });

        if ([] !== $existingPermission) {
            $permissionId = reset($existingPermission)['_id'];
            $this->datastoreApiService->removePermission($datastoreId, $permissionId)->await();
        }
    }

    /**
     * @return array<mixed>
     */
    private function getEndpointByAccess(string $datastoreId, string $configType, ServiceAccess $access): array
    {
        $open = $access->isOpen();

        return $this->cache->get(sprintf('datastore-%s-endpoint-%s-%s', $datastoreId, $configType, $open ? 'open' : 'closed'), function (ItemInterface $item) use ($datastoreId, $configType, $open) {
            $item->expiresAfter(3600);

            $endpoints = $this->datastoreApiService->getEndpointsList($datastoreId, [
                'type' => $configType,
                'open' => $open,
            ]);

            if (0 === count($endpoints)) {
                throw new AppException('Aucun point d’accès (endpoint) du datastore ne peut convenir à la demande', Response::HTTP_BAD_REQUEST, ['type' => $configType, 'open' => $open]);
            }

            return $endpoints[0]['endpoint'];
        });
    }

    /**
     * Supprime les permissions expirées de l’offre accordées à ces communautés.
     *
     * @param array<mixed>  $offering
     * @param array<mixed>  $permissions  permissions du datastore
     * @param array<string> $communityIds
     *
     * @return array<mixed> permissions restantes
     */
    private function removeExpiredPermissions(string $datastoreId, array $offering, array $permissions, array $communityIds): array
    {
        return array_values(array_filter($permissions, function (array $permission) use ($datastoreId, $offering, $communityIds): bool {
            $expired = $this->isPermissionExpired($permission)
                && in_array($permission['beneficiary']['_id'] ?? null, $communityIds, true)
                && in_array($offering['_id'], array_column($permission['offerings'] ?? [], '_id'), true);
            if ($expired) {
                $this->datastoreApiService->removePermission($datastoreId, $permission['_id'])->await();
            }

            return !$expired;
        }));
    }

    /**
     * Retourne les permissions créées (aucune si elle existait déjà).
     *
     * @param array<mixed> $offering
     * @param array<mixed> $permissions permissions existantes du datastore
     *
     * @return array<mixed>
     */
    private function addPermissionForCommunity(string $producerDatastoreId, string $consumerCommunityId, array $offering, array $permissions): array
    {
        $offeringId = $offering['_id'];

        $communityPermissions = array_filter($permissions, function ($permission) use ($offeringId, $consumerCommunityId) {
            return isset($permission['offerings']) && in_array($offeringId, array_column($permission['offerings'], '_id'))
                && isset($permission['beneficiary']['_id']) && $permission['beneficiary']['_id'] === $consumerCommunityId;
        });

        if ([] !== $communityPermissions) {
            return [];
        }

        $endDate = new \DateTime();
        $endDate->add(new \DateInterval('P6M')); // date du jour + 6 mois
        $endDate->setTime(23, 59, 0);

        $permissionRequestBody = [
            'end_date' => $endDate->format(\DateTime::ATOM),
            'licence' => sprintf('Utilisation de %s', $offering['layer_name']),
            'offerings' => [$offering['_id']],
            'type' => PermissionTypes::COMMUNITY,
            'only_oauth' => false,
            'communities' => [$consumerCommunityId],
        ];

        return $this->datastoreApiService->addPermission($producerDatastoreId, $permissionRequestBody)->array();
    }

    /**
     * @param array<mixed> $offering
     */
    private function getServiceType(array $offering): ?string
    {
        switch ($offering['type']) {
            case OfferingTypes::WFS:
                return 'WFS';
            case OfferingTypes::WMSVECTOR:
            case OfferingTypes::WMSRASTER:
                return 'WMS';
            case OfferingTypes::WMTSTMS:
                if (isset($offering['tms_metadata']['tiles'][0])) {
                    return null;
                }

                return 'WMTS';
            default: return null;
        }
    }
}
