<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationMetadataTypes;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\OfferingTypes;
use App\Constants\EntrepotApi\PermissionTypes;
use App\Constants\EntrepotApi\Sandbox;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Dto\Services\CommonDTO;
use App\Entity\CswMetadata\CswMetadata;
use App\Entity\CswMetadata\CswMetadataLayer;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\GeonetworkApiService;
use App\Services\SandboxService;
use App\Utils;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * `Service` sur cartes.gouv.fr qui représente un `offering` et une `configuration` de l'`API Entrepôt`, ainsi que les fichiers de style (`styles`), `tms_metadata` et url de partage (`share_url`).
 */
class CartesServiceApiService
{
    private HttpClientInterface $httpClient;

    public function __construct(
        private ParameterBagInterface $params,
        private ConfigurationApiService $configurationApiService,
        private AnnexeApiService $annexeApiService,
        private DatastoreApiService $datastoreApiService,
        private StaticApiService $staticApiService,
        private StoredDataApiService $storedDataApiService,
        private CapabilitiesService $capabilitiesService,
        private CartesMetadataApiService $cartesMetadataApiService,
        private SandboxService $sandboxService,
        private CartesStylesApiService $cartesStylesApiService,
        private GeonetworkApiService $geonetworkApiService,
        private CacheInterface $cache,
        private LoggerInterface $logger,
        HttpClientInterface $httpClient,
    ) {
        $this->httpClient = $httpClient->withOptions([
            'proxy' => $params->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    public function getService(string $datastoreId, string $offeringId): array
    {
        $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
        $offering['configuration'] = $this->configurationApiService->get($datastoreId, $offering['configuration']['_id']);

        // traitement spécial pour WMTS-TMS
        if (OfferingTypes::WMTSTMS === $offering['type']) {
            $storedData = $this->storedDataApiService->get($datastoreId, $offering['configuration']['type_infos']['used_data'][0]['stored_data']);
            $offering['configuration']['pyramid'] = $storedData;

            // TMS
            if (StoredDataTypes::ROK4_PYRAMID_VECTOR === $storedData['type']) {
                // Metadatas (TMS)
                $urls = array_values(array_filter($offering['urls'], static function ($url) {
                    return 'TMS' == $url['type'];
                }));
                $url = $urls[0]['url'].'/metadata.json';

                try {
                    $response = $this->httpClient->request('GET', $url);
                    if (Response::HTTP_OK === $response->getStatusCode()) {
                        $offering['tms_metadata'] = $response->toArray();
                    }
                } catch (\Throwable $th) {
                }
            }
        }

        $styles = [];
        if (OfferingTypes::WFS === $offering['type'] || OfferingTypes::WMTSTMS === $offering['type']) {
            $styles = $this->cartesStylesApiService->getStyles($datastoreId, $offering['configuration']);
        }
        $offering['configuration']['styles'] = $styles;

        // url de partage (url capabilities si WFS ou WMS-VECTOR, url spécifique si TMS)
        $offering['share_url'] = $this->getShareUrl($datastoreId, $offering);

        return $offering;
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
                    $serviceType = $this->getServiceType($offering);
                    $shareUrl = $this->capabilitiesService->getGetCapUrl($endpoint['endpoint']['urls'][0]['url'], $offering['urls'][0]['url'], $serviceType);
                } else {
                    $annexeUrl = $this->params->get('annexes_url');
                    $shareUrl = join('/', [$annexeUrl, $datastore['technical_name'],  $endpoint['endpoint']['technical_name'], 'capabilities.xml']);
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
                        $shareUrl = join('/', [$annexeUrl, $datastore['technical_name'],  $endpoint['endpoint']['technical_name'], 'capabilities.xml']);
                    }
                }
                break;

            default:
                break;
        }

        return $shareUrl;
    }

    public function unpublish(string $datastoreId, string $offeringId): void
    {
        $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);

        switch ($offering['type']) {
            case OfferingTypes::WFS:
                $this->wfsUnpublish($datastoreId, $offering);
                break;
            case OfferingTypes::WMTSTMS:
                $this->wmtsTmsUnpublish($datastoreId, $offering);
                break;
            case OfferingTypes::WMSVECTOR:
                $this->wmsVectorUnpublish($datastoreId, $offering);
                break;
            case OfferingTypes::WMSRASTER:
                $this->wmsRasterUnpublish($datastoreId, $offering);
        }
    }

    /**
     * @param array<mixed> $offering
     */
    public function wfsUnpublish(string $datastoreId, array $offering, bool $removeStyleFiles = true): void
    {
        // suppression de l'offering
        $this->configurationApiService->removeOffering($datastoreId, $offering['_id']);
        $configurationId = $offering['configuration']['_id'];

        // suppression de la configuration
        // la suppression de l'offering nécessite quelques instants, et tant que la suppression de l'offering n'est pas faite, on ne peut pas demander la suppression de la configuration
        while (1) {
            sleep(3);
            $configuration = $this->configurationApiService->get($datastoreId, $configurationId);
            if (ConfigurationStatuses::UNPUBLISHED === $configuration['status']) {
                break;
            }
        }
        $this->configurationApiService->remove($datastoreId, $configurationId);

        if (true === $removeStyleFiles) {
            $this->removeStyleFiles($datastoreId, $configuration);
        }
    }

    /**
     * @param array<mixed> $offering
     */
    public function wmsVectorUnpublish(string $datastoreId, array $offering, bool $removeStyleFiles = true): void
    {
        // suppression de l'offering
        $this->configurationApiService->removeOffering($datastoreId, $offering['_id']);
        $configurationId = $offering['configuration']['_id'];
        $configuration = null;

        // suppression de la configuration
        // la suppression de l'offering nécessite quelques instants, et tant que la suppression de l'offering n'est pas faite, on ne peut pas demander la suppression de la configuration
        while (1) {
            sleep(3);
            $configuration = $this->configurationApiService->get($datastoreId, $configurationId);
            if (ConfigurationStatuses::UNPUBLISHED === $configuration['status']) {
                break;
            }
        }
        $this->configurationApiService->remove($datastoreId, $configurationId);

        if (true === $removeStyleFiles) {
            // récup tous les fichiers statiques liés à la config
            $staticFilesIdList = array_map(function ($relation) {
                return $relation['style'];
            }, $configuration['type_infos']['used_data'][0]['relations']);

            foreach ($staticFilesIdList as $staticId) {
                $this->staticApiService->delete($datastoreId, $staticId);
            }
        }
    }

    /**
     * @param array<mixed> $offering
     */
    public function wmsRasterUnpublish(string $datastoreId, array $offering): void
    {
        // suppression de l'offering
        $this->configurationApiService->removeOffering($datastoreId, $offering['_id']);
        $configurationId = $offering['configuration']['_id'];

        // suppression de la configuration
        // la suppression de l'offering nécessite quelques instants, et tant que la suppression de l'offering n'est pas faite, on ne peut pas demander la suppression de la configuration
        while (1) {
            sleep(3);
            $configuration = $this->configurationApiService->get($datastoreId, $configurationId);
            if (ConfigurationStatuses::UNPUBLISHED === $configuration['status']) {
                break;
            }
        }
        $this->configurationApiService->remove($datastoreId, $configurationId);
    }

    /**
     * @param array<mixed> $offering
     */
    public function wmtsTmsUnpublish(string $datastoreId, array $offering, bool $removeStyleFiles = true): void
    {
        // suppression de l'offering
        $this->configurationApiService->removeOffering($datastoreId, $offering['_id']);
        $configurationId = $offering['configuration']['_id'];

        // suppression de la configuration
        // la suppression de l'offering nécessite quelques instants, et tant que la suppression de l'offering n'est pas faite, on ne peut pas demander la suppression de la configuration
        while (1) {
            sleep(3);
            $configuration = $this->configurationApiService->get($datastoreId, $configurationId);
            if (ConfigurationStatuses::UNPUBLISHED === $configuration['status']) {
                break;
            }
        }
        $this->configurationApiService->remove($datastoreId, $configurationId);

        if (true === $removeStyleFiles) {
            $this->removeStyleFiles($datastoreId, $configuration);
        }
    }

    /**
     * Suppression des styles (les fichiers annexes) liés à une configuration.
     *
     * @param array<mixed> $configuration
     */
    private function removeStyleFiles(string $datastoreId, array $configuration): void
    {
        $styles = $this->cartesStylesApiService->getStyles($datastoreId, $configuration);

        foreach ($styles as $style) {
            if (array_key_exists('layers', $style)) {
                foreach ($style['layers'] as $layer) {
                    $this->annexeApiService->remove($datastoreId, $layer['annexe_id']);
                }
            }
        }
    }

    /**
     * Crée ou modifie un service (offering/configuration).
     *
     * @param array<mixed>  $configRequestBody
     * @param ?array<mixed> $oldOffering
     */
    public function saveService(
        string $datastoreId,
        string $storedDataId,
        CommonDTO $dto,
        string $type,
        array $configRequestBody,
        ?array $oldOffering = null,
    ): array {
        $datasheetName = null;
        $endpoint = $this->getEndpointByShareType($datastoreId, $type, $dto->share_with);

        // Mise à jour des métadonnées de la configuration
        $configRequestBody['metadata'] = $this->getNewConfigMetadata($dto->identifier, $configRequestBody['metadata'] ?? []);
        $configTags = [
            CommonTags::CONFIG_THEME => implode(', ', $dto->category),
        ];

        if ($oldOffering) {
            // Modification d'un service existant
            $oldConfiguration = $oldOffering['configuration'];
            $datasheetName = $oldConfiguration['tags'][CommonTags::DATASHEET_NAME];

            $configTags[CommonTags::DATASHEET_NAME] = $datasheetName;

            // Mise à jour de la configuration
            $configuration = $this->configurationApiService->replace($datastoreId, $oldConfiguration['_id'], $configRequestBody);
            $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], $configTags);

            // On recrée l'offering si changement d'endpoint, sinon demande la synchronisation
            if ($oldOffering['open'] !== $endpoint['open']) {
                $this->configurationApiService->removeOffering($datastoreId, $oldOffering['_id']);

                $offering = $this->configurationApiService->addOffering($datastoreId, $oldConfiguration['_id'], $endpoint['_id'], $endpoint['open']);
            } else {
                $offering = $this->configurationApiService->syncOffering($datastoreId, $oldOffering['_id']);
            }
        } else {
            // Ajout d'un nouveau service
            $storedData = $this->storedDataApiService->get($datastoreId, $storedDataId);
            $datasheetName = $storedData['tags'][CommonTags::DATASHEET_NAME];

            $configTags[CommonTags::DATASHEET_NAME] = $datasheetName;

            // Ajout de la configuration
            $configuration = $this->configurationApiService->add($datastoreId, $configRequestBody);
            $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], $configTags);

            // Création d'une offering
            try {
                $offering = $this->configurationApiService->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
            } catch (\Throwable $th) {
                // si la création de l'offering plante, on défait la création de la config
                $this->configurationApiService->remove($datastoreId, $configuration['_id']);
                throw $th;
            }
        }

        $offering['configuration'] = $configuration;

        // Création ou modification des permissions de la communauté actuelle ou de config
        $this->handlePermissions($datastoreId, $offering, $dto);

        // Création ou mise à jour du capabilities dans le cas ou l'on est pas dans l'espace découverte (sandbox)
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

        // Création ou mise à jour de metadata
        $formData = json_decode(json_encode($dto), true);
        if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
            $formData['identifier'] = Sandbox::LAYERNAME_PREFIX.$formData['identifier'];
        }
        $apiMetadata = $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $formData);

        // Synchronisation des autres services de la même fiche de données
        /** @var CswMetadata */
        $cswMetadata = $apiMetadata['csw_metadata'];

        $this->synchroniseSiblingServices($datastoreId, $offering, $configTags[CommonTags::CONFIG_THEME], $cswMetadata, $dto);

        return $offering;
    }

    /**
     * @param array<mixed> $offering
     */
    private function synchroniseSiblingServices(string $datastoreId, array $offering, string $configTheme, CswMetadata $cswMetadata, CommonDTO $dto): void
    {
        $siblingServices = array_map(fn (CswMetadataLayer $layer) => $layer->offeringId, $cswMetadata->layers ?? []);
        $siblingServices = array_filter($siblingServices, fn (string $serviceId) => $serviceId !== $offering['_id']);
        $keywords = [...$dto->category, ...$dto->keywords, ...$dto->free_keywords];

        $capabilitiesUpdateArgs = [];

        foreach ($siblingServices as $siblingServiceId) {
            try {
                $offering = $this->configurationApiService->getOffering($datastoreId, $siblingServiceId);
                $configuration = $this->configurationApiService->get($datastoreId, $offering['configuration']['_id']);

                // Mise à jour des tags seulement si nécessaire
                if ($configTheme !== ($configuration['tags'][CommonTags::CONFIG_THEME] ?? '')) {
                    $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], [
                        CommonTags::CONFIG_THEME => $configTheme,
                    ]);
                }

                $configMetadata = $this->getNewConfigMetadata($dto->identifier, $configuration['metadata'] ?? []);
                $currentKeywords = $configuration['type_infos']['keywords'] ?? [];

                $needsMetadataUpdate = !Utils::deep_array_equals($configMetadata, $configuration['metadata'] ?? []);
                $needsKeywordsUpdate = !Utils::deep_array_equals($keywords, $currentKeywords);

                if ($needsMetadataUpdate || $needsKeywordsUpdate) {
                    $configRequestBody = [
                        'type' => $configuration['type'],
                        'name' => $configuration['name'],
                        'type_infos' => $configuration['type_infos'],
                        'metadata' => $configMetadata,
                    ];

                    // Les services WFS n'ont pas de keywords globaux au niveau de type_infos, mais des keywords pour chaque relation de used_data
                    if (ConfigurationTypes::WFS !== $configuration['type']) {
                        $configRequestBody['type_infos']['keywords'] = $keywords;
                    }

                    if (isset($configuration['attribution']['title']) && isset($configuration['attribution']['url'])) {
                        $configRequestBody['attribution'] = [
                            'title' => $configuration['attribution']['title'],
                            'url' => $configuration['attribution']['url'],
                        ];
                    }

                    $configuration = $this->configurationApiService->replace($datastoreId, $configuration['_id'], $configRequestBody);
                    $offering = $this->configurationApiService->syncOffering($datastoreId, $offering['_id']);

                    $endpoint = $this->getEndpointByShareType($datastoreId, $configuration['type'], 'all_public');
                    if (!in_array($endpoint['_id'], array_map(fn (array $endpoint) => $endpoint['endpoint']['_id'], $capabilitiesUpdateArgs))) {
                        $capabilitiesUpdateArgs[] = [
                            'datastore_id' => $datastoreId,
                            'endpoint' => $endpoint,
                            'offering' => $offering,
                        ];
                    }
                }
            } catch (\Throwable $e) {
                $this->logger->warning('{class}: Failed to synchronise sibling service {serviceId}: {error}', [
                    'class' => self::class,
                    'serviceId' => $siblingServiceId,
                    'exception' => $e,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Mise à jour des capabilities pour les services synchronisés
        foreach ($capabilitiesUpdateArgs as $args) {
            try {
                $this->capabilitiesService->createOrUpdate($args['datastore_id'], $args['endpoint'], $args['offering']['urls'][0]['url']);
            } catch (\Exception $e) {
                $this->logger->warning('{class}: Failed to create or update capabilities for endpoint {endpointName} ({endpoint}) after the creation/modification of offering {offeringId}: {error}', [
                    'class' => self::class,
                    'endpoint' => $args['endpoint']['_id'],
                    'endpointName' => $args['endpoint']['technical_name'],
                    'offeringId' => $args['offering']['_id'],
                    'exception' => $e,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * @param array<mixed> $configMetadata
     */
    public function getNewConfigMetadata(string $fileIdentifier, array $configMetadata = []): array
    {
        $geonetworkBaseUrl = $this->geonetworkApiService->getBaseUrl();
        $catalogueBaseUrl = (string) $this->params->get('catalogue_url');

        // supprimer les anciennes métadonnées si elles existent déjà
        $configMetadata = array_filter($configMetadata, function ($md) use ($geonetworkBaseUrl, $catalogueBaseUrl) {
            return !(
                ('application/xml' === $md['format'] && ConfigurationMetadataTypes::ISO19115_2003 === $md['type'] && str_starts_with($md['url'], $geonetworkBaseUrl))
                || ('text/html' === $md['format'] && ConfigurationMetadataTypes::OTHER === $md['type'] && str_starts_with($md['url'], $catalogueBaseUrl))
            );
        });
        $configMetadata = array_values($configMetadata);

        $configMetadata[] = [
            'format' => 'application/xml',
            'url' => $geonetworkBaseUrl.$this->geonetworkApiService->getUrl($fileIdentifier),
            'type' => ConfigurationMetadataTypes::ISO19115_2003,
        ];
        $configMetadata[] = [
            'format' => 'text/html',
            'url' => implode('/', [$catalogueBaseUrl, 'dataset', $fileIdentifier]),
            'type' => ConfigurationMetadataTypes::OTHER,
        ];

        return $configMetadata;
    }

    /**
     * Crée, modifie ou supprime des permissions de la communauté actuelle ou de config.
     *
     * @param array<mixed> $offering
     */
    private function handlePermissions(string $datastoreId, array $offering, CommonDTO $dto): void
    {
        // création d'une permission pour la communauté actuelle
        if ('your_community' === $dto->share_with) {
            $this->addPermissionForCurrentCommunity($datastoreId, $offering);
        }

        if (false === $offering['open']) {
            // création d'une permission pour la communauté config si demandée
            $configCommunityId = $this->params->get('config')['community_id'];
            if ($dto->allow_view_data) {
                $this->addPermissionForCommunity($datastoreId, $configCommunityId, $offering);
            } else {
                // sinon suppression de la permission pour la communauté config si elle existe déjà (elle a été créée lors de la création ou d'une modification précédente de l'offering)
                $this->removeExistingConfigPermission($datastoreId, $offering);
            }
        }
    }

    /**
     * @param array<mixed> $offering
     */
    private function removeExistingConfigPermission(string $datastoreId, array $offering): void
    {
        $configCommunityId = $this->params->get('config')['community_id'];
        $permissions = $this->datastoreApiService->getPermissions($datastoreId);

        $existingPermission = array_filter($permissions, function ($permission) use ($offering, $configCommunityId) {
            return isset($permission['offerings'])
                && in_array($offering['_id'], array_column($permission['offerings'], '_id'))
                && isset($permission['beneficiary']['_id'])
                && $permission['beneficiary']['_id'] === $configCommunityId;
        });

        if (!empty($existingPermission)) {
            $permissionId = reset($existingPermission)['_id'];
            $this->datastoreApiService->removePermission($datastoreId, $permissionId);
        }
    }

    private function getEndpointByShareType(string $datastoreId, string $configType, string $shareWith): array
    {
        return $this->cache->get("datastore-{$datastoreId}-endpoint-{$configType}-{$shareWith}", function (ItemInterface $item) use ($datastoreId, $configType, $shareWith) {
            $item->expiresAfter(3600);

            if ('all_public' === $shareWith) {
                $open = true;
            } elseif ('your_community' === $shareWith) {
                $open = false;
            } else {
                throw new CartesApiException('Valeur du champ [share_with] est invalide', Response::HTTP_BAD_REQUEST, ['share_with' => $shareWith]);
            }

            $endpoints = $this->datastoreApiService->getEndpointsList($datastoreId, [
                'type' => $configType,
                'open' => $open,
            ]);

            if (0 === count($endpoints)) {
                throw new CartesApiException("Aucun point d'accès (endpoint) du datastore ne peut convenir à la demande", Response::HTTP_BAD_REQUEST, ['share_with' => $shareWith]);
            }

            return $endpoints[0]['endpoint'];
        });
    }

    /**
     * @param array<mixed> $offering
     */
    private function addPermissionForCurrentCommunity(string $datastoreId, array $offering): void
    {
        $datastore = $this->datastoreApiService->get($datastoreId);
        $this->addPermissionForCommunity($datastoreId, $datastore['community']['_id'], $offering);
    }

    /**
     * @param array<mixed> $offering
     */
    private function addPermissionForCommunity(string $producerDatastoreId, string $consumerCommunityId, array $offering): void
    {
        $permissions = $this->datastoreApiService->getPermissions($producerDatastoreId);
        $offeringId = $offering['_id'];

        $offeringPermissions = array_filter($permissions, function ($permission) use ($offeringId) {
            return isset($permission['offerings']) && in_array($offeringId, array_column($permission['offerings'], '_id'));
        });

        $permissionExists = array_reduce($offeringPermissions, function ($carry, $permission) use ($consumerCommunityId) {
            return $carry || (isset($permission['beneficiary']['_id']) && $permission['beneficiary']['_id'] === $consumerCommunityId);
        }, false);

        if ($permissionExists) {
            return;
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

        $this->datastoreApiService->addPermission($producerDatastoreId, $permissionRequestBody);
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
