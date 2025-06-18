<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationMetadataTypes;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\OfferingTypes;
use App\Constants\EntrepotApi\PermissionTypes;
use App\Constants\EntrepotApi\Sandbox;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Dto\Services\CommonDTO;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\GeonetworkApiService;
use App\Services\SandboxService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Response;
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
        $datastore = $this->datastoreApiService->get($datastoreId);
        $endpointId = $offering['endpoint']['_id'];

        $endpoint = $this->datastoreApiService->getEndpoint($datastoreId, $endpointId);
        $shareUrl = null;

        switch ($offering['type']) {
            case OfferingTypes::WFS:
            case OfferingTypes::WMSVECTOR:
            case OfferingTypes::WMSRASTER:
                $annexeUrl = $this->params->get('annexes_url');
                $shareUrl = join('/', [$annexeUrl, $datastore['technical_name'],  $endpoint['endpoint']['technical_name'], 'capabilities.xml']);
                break;

            case OfferingTypes::WMTSTMS:
                if (isset($offering['tms_metadata']['tiles'][0])) {
                    $shareUrl = $offering['tms_metadata']['tiles'][0];
                }

                if (isset($offering['configuration']['pyramid']['type']) && StoredDataTypes::ROK4_PYRAMID_RASTER === $offering['configuration']['pyramid']['type']) {
                    $annexeUrl = $this->params->get('annexes_url');
                    $shareUrl = join('/', [$annexeUrl, $datastore['technical_name'],  $endpoint['endpoint']['technical_name'], 'capabilities.xml']);
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
        $configTheme = implode(', ', $dto->category);

        if ($oldOffering) {
            // Modification d'un service existant
            $oldConfiguration = $oldOffering['configuration'];
            $datasheetName = $oldConfiguration['tags'][CommonTags::DATASHEET_NAME];

            $configTags = [
                CommonTags::DATASHEET_NAME => $datasheetName,
                CommonTags::CONFIG_THEME => $configTheme,
            ];

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

            $configTags = [
                CommonTags::DATASHEET_NAME => $datasheetName,
                CommonTags::CONFIG_THEME => $configTheme,
            ];

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

        // Création ou mise à jour du capabilities
        try {
            $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
        } catch (\Exception $e) {
        }

        // Création ou mise à jour de metadata
        $formData = json_decode(json_encode($dto), true);
        if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
            $formData['identifier'] = Sandbox::LAYERNAME_PREFIX.$formData['identifier'];
        }
        $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $formData);

        return $offering;
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
}
