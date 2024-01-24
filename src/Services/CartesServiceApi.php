<?php

namespace App\Services;

use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\OfferingTypes;
use App\Constants\EntrepotApi\StaticFileTypes;
use App\Exception\EntrepotApiException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * `Service` sur cartes.gouv.fr qui représente un `offering` et une `configuration` de l'`API Entrepôt`, ainsi que les fichiers de style (`styles`), `tms_metadata` et url de partage (`share_url`).
 */
class CartesServiceApi
{
    private HttpClientInterface $httpClient;

    public function __construct(private EntrepotApiService $entrepotApiService, private ParameterBagInterface $params, HttpClientInterface $httpClient)
    {
        $this->httpClient = $httpClient->withOptions([
            'proxy' => $params->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    public function getService(string $datastoreId, string $offeringId): array
    {
        $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
        $offering['configuration'] = $this->entrepotApiService->configuration->get($datastoreId, $offering['configuration']['_id']);

        // Metadatas (TMS)
        if (OfferingTypes::WMTSTMS === $offering['type']) {
            $urls = array_values(array_filter($offering['urls'], static function ($url) {
                return 'TMS' == $url['type'];
            }));
            $url = $urls[0]['url'].'/metadata.json';

            $response = $this->httpClient->request('GET', $url);
            if (Response::HTTP_OK != $response->getStatusCode()) {
                throw new EntrepotApiException("Request $url failed");
            }
            $offering['tms_metadata'] = $response->toArray();
        }

        $styles = [];
        if (OfferingTypes::WFS === $offering['type'] || OfferingTypes::WMTSTMS === $offering['type']) {
            $styles = $this->getStyles($datastoreId, $offering['configuration']['_id']);
        }
        $offering['configuration']['styles'] = $styles;

        // url de partage (url capabilities si WFS ou WMS-VECTOR, url spécifique si TMS)
        $offering['share_url'] = $this->getShareUrl($datastoreId, $offering);

        return $offering;
    }

    /**
     * Recherche des styles et ajout de l'url.
     *
     * @return array<mixed>
     */
    // TODO PEUT ETRE S'APPUYER SUR LES TAGS
    public function getStyles(string $datastoreId, string $configId): array
    {
        $path = "/configuration/$configId/styles.json";
        $styleAnnexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, $path);

        $styles = [];
        if (count($styleAnnexes)) {
            $content = $this->entrepotApiService->annexe->download($datastoreId, $styleAnnexes[0]['_id']);
            $styles = json_decode($content, true);
        }

        return $styles;
    }

    /**
     * @param array<mixed> $offering
     */
    public function getShareUrl(string $datastoreId, array $offering): ?string
    {
        $datastore = $this->entrepotApiService->datastore->get($datastoreId);
        $endpointId = $offering['endpoint']['_id'];

        $endpoint = $this->entrepotApiService->datastore->getEndpoint($datastoreId, $endpointId);
        $shareUrl = null;

        switch ($offering['type']) {
            case OfferingTypes::WFS:
            case OfferingTypes::WMSVECTOR:
                $annexeUrl = $this->params->get('annexes_url');
                $shareUrl = join('/', [$annexeUrl, $datastore['technical_name'],  $endpoint['endpoint']['technical_name'], 'capabilities.xml']);
                break;

            case OfferingTypes::WMTSTMS:
                if (isset($offering['tms_metadata']['tiles'][0])) {
                    $shareUrl = $offering['tms_metadata']['tiles'][0];
                }
                break;

            default:
                break;
        }

        return $shareUrl;
    }

    public function unpublish(string $datastoreId, string $offeringId): void
    {
        $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);

        switch ($offering['type']) {
            case OfferingTypes::WFS:
                $this->wfsUnpublish($datastoreId, $offering);
                break;
            case OfferingTypes::WMTSTMS:
                $this->tmsUnpublish($datastoreId, $offering);
                break;
            case OfferingTypes::WMSVECTOR:
                $this->wmsVectorUnpublish($datastoreId, $offering);
                break;
        }
    }

    /**
     * @param array<mixed> $offering
     */
    private function wfsUnpublish(string $datastoreId, array $offering): void
    {
        $offering['configuration'] = $this->entrepotApiService->configuration->get($datastoreId, $offering['configuration']['_id']);

        // suppression de l'offering
        $this->entrepotApiService->configuration->removeOffering($datastoreId, $offering['_id']);
        $configurationId = $offering['configuration']['_id'];

        // suppression de la configuration
        // la suppression de l'offering nécessite quelques instants, et tant que la suppression de l'offering n'est pas faite, on ne peut pas demander la suppression de la configuration
        while (1) {
            sleep(3);
            $configuration = $this->entrepotApiService->configuration->get($datastoreId, $configurationId);
            if (ConfigurationStatuses::UNPUBLISHED === $configuration['status']) {
                break;
            }
        }
        $this->entrepotApiService->configuration->remove($datastoreId, $configurationId);

        // TODO : supprimer les fichiers de styles en annexe qui sont référencés dans les tags de la configuration
    }

    /**
     * @param array<mixed> $offering
     */
    private function wmsVectorUnpublish(string $datastoreId, array $offering): void
    {
        $offering['configuration'] = $this->entrepotApiService->configuration->get($datastoreId, $offering['configuration']['_id']);

        // récup tous les fichiers statiques liés à la stored_data
        $storedDataId = $offering['configuration']['type_infos']['used_data'][0]['stored_data'];
        $staticFiles = $this->entrepotApiService->static->getAll($datastoreId, [
            'type' => StaticFileTypes::GEOSERVER_STYLE,
            'name' => sprintf('storeddata_%s_style_wmsv_%%', $storedDataId),
        ]);

        // suppression de l'offering
        $this->entrepotApiService->configuration->removeOffering($datastoreId, $offering['_id']);
        $configurationId = $offering['configuration']['_id'];

        // suppression de la configuration
        // la suppression de l'offering nécessite quelques instants, et tant que la suppression de l'offering n'est pas faite, on ne peut pas demander la suppression de la configuration
        while (1) {
            sleep(3);
            $configuration = $this->entrepotApiService->configuration->get($datastoreId, $configurationId);
            if (ConfigurationStatuses::UNPUBLISHED === $configuration['status']) {
                break;
            }
        }
        $this->entrepotApiService->configuration->remove($datastoreId, $configurationId);

        foreach ($staticFiles as $staticFile) {
            $this->entrepotApiService->static->delete($datastoreId, $staticFile['_id']);
        }
    }

    /**
     * @param array<mixed> $offering
     */
    private function tmsUnpublish(string $datastoreId, array $offering): void
    {
        $offering['configuration'] = $this->entrepotApiService->configuration->get($datastoreId, $offering['configuration']['_id']);

        // suppression de l'offering
        $this->entrepotApiService->configuration->removeOffering($datastoreId, $offering['_id']);
        $configurationId = $offering['configuration']['_id'];

        // suppression de la configuration
        // la suppression de l'offering nécessite quelques instants, et tant que la suppression de l'offering n'est pas faite, on ne peut pas demander la suppression de la configuration
        while (1) {
            sleep(3);
            $configuration = $this->entrepotApiService->configuration->get($datastoreId, $configurationId);
            if (ConfigurationStatuses::UNPUBLISHED === $configuration['status']) {
                break;
            }
        }
        $this->entrepotApiService->configuration->remove($datastoreId, $configurationId);

        // TODO : supprimer les fichiers de styles en annexe qui sont référencés dans les tags de la configuration
    }
}
