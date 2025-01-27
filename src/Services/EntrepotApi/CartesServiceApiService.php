<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\OfferingTypes;
use App\Constants\EntrepotApi\StoredDataTypes;
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
            $styles = $this->getStyles($datastoreId, $offering['configuration']);
        }
        $offering['configuration']['styles'] = $styles;

        // url de partage (url capabilities si WFS ou WMS-VECTOR, url spécifique si TMS)
        $offering['share_url'] = $this->getShareUrl($datastoreId, $offering);

        return $offering;
    }

    /**
     * Recherche des styles et ajout de l'url. Les styles sont désormais stockés dans extra. Cette fonction est prévue pour migrer les styles stockés dans les annexes vers extra.
     *
     * @param array<mixed> $configuration
     *
     * @return array<mixed>
     */
    public function getStyles(string $datastoreId, array $configuration): array
    {
        $styles = null;

        // vérifier si styles est présent dans extra
        if (isset($configuration['extra']['styles'])) {
            $styles = $configuration['extra']['styles'];
        }

        // vérifier si styles est présent dans une annexe
        $path = "/configuration/{$configuration['_id']}/styles.json";
        $styleAnnexes = $this->annexeApiService->getAll($datastoreId, null, $path);

        // si styles est présent dans une annexe et non dans extra, on le stocke dans extra et on supprime l'annexe
        if (count($styleAnnexes)) {
            // on ne lit l'annexe styles que si elle n'est pas déjà dans extra
            if (null === $styles) {
                $content = $this->annexeApiService->download($datastoreId, $styleAnnexes[0]['_id']);
                $styles = json_decode($content, true);

                $extra = ['styles' => $styles];
                $this->configurationApiService->modify($datastoreId, $configuration['_id'], ['extra' => $extra]);
            }

            $this->annexeApiService->remove($datastoreId, $styleAnnexes[0]['_id']);
        }

        return $styles ?? [];
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
        $styles = $this->getStyles($datastoreId, $configuration);

        foreach ($styles as $style) {
            if (array_key_exists('layers', $style)) {
                foreach ($style['layers'] as $layer) {
                    $this->annexeApiService->remove($datastoreId, $layer['annexe_id']);
                }
            }
        }
    }
}
