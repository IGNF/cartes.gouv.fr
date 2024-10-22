<?php

namespace App\Services;

use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class CapabilitiesService
{
    private Filesystem $fs;

    public function __construct(
        private ParameterBagInterface $parameterBag,
        private HttpClientInterface $httpClient,
        private AnnexeApiService $annexeApiService,
        private ConfigurationApiService $configurationApiService,
    ) {
        $this->httpClient = $httpClient->withOptions([
            'proxy' => $parameterBag->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);

        $this->fs = new Filesystem();
    }

    /**
     * Creation ou mise a jour de l'annexe capabilities lorsque d'un service est ajouté, mis à jour
     * ou supprimé.
     *
     * @param array<mixed> $endpoint
     */
    public function createOrUpdate(string $datastoreId, array $endpoint, string $url): ?array
    {
        $capsPath = $this->parameterBag->get('capabilities_path');
        if (!$this->fs->exists($capsPath)) {
            $this->fs->mkdir($capsPath);
        }

        // Endpoint privé, on sort
        if (!$endpoint['open']) {
            return null;
        }

        $xmlStr = null;
        switch ($endpoint['type']) {
            case ConfigurationTypes::WFS:
                $xmlStr = $this->filterWFSCapabilities($datastoreId, $endpoint, $url);
                break;
            case ConfigurationTypes::WMSVECTOR:
            case ConfigurationTypes::WMSRASTER:
                $xmlStr = $this->filterWMSCapabilities($datastoreId, $endpoint, $url);
                break;
            case ConfigurationTypes::WMTSTMS:
                // uniquement pour le WMTS
                $xmlStr = $this->filterWMTSCapabilities($datastoreId, $endpoint, $url);
                break;
            default:
                return null;
        }

        $uuid = uniqid();
        $filePath = join(DIRECTORY_SEPARATOR, [realpath($capsPath), "capabilities-$uuid.xml"]);

        // Creation du fichier
        file_put_contents($filePath, $xmlStr);

        // On regarde s'il existe deja un fichier avec ce path
        $path = join('/', [$endpoint['technical_name'], 'capabilities.xml']);

        $annexes = $this->annexeApiService->getAll($datastoreId, null, "/$path");
        $annexe = null;
        if (count($annexes)) {  // Il existe, on le met a jour
            $annexe = $this->annexeApiService->replaceFile($datastoreId, $annexes[0]['_id'], $filePath);
        } else {
            $annexe = $this->annexeApiService->add($datastoreId, $filePath, [$path], ['type=capabilities']);
        }

        $this->fs->remove($filePath);

        return $annexe;
    }

    public function getGetCapUrl(string $endpointUrl, string $offeringUrl, string $serviceType): string
    {
        $version = $this->getServiceVersion($offeringUrl);

        return sprintf('%s?SERVICE=%s&VERSION=%s&request=GetCapabilities', $endpointUrl, $serviceType, $version);
    }

    private function filterWFSCapabilities(string $datastoreId, mixed $endpoint, string $url): string
    {
        $allOfferings = $this->configurationApiService->getAllOfferings($datastoreId, ['endpoint' => $endpoint['_id']]);

        // Les couches liees aux offerings
        $layerNames = [];
        foreach ($allOfferings as $offering) {
            $layerNames[] = $offering['layer_name'];
        }

        $getCapUrl = $this->getGetCapUrl($endpoint['urls'][0]['url'], $url, 'WFS');

        $response = $this->httpClient->request('GET', $getCapUrl);
        if (JsonResponse::HTTP_OK != $response->getStatusCode()) {
            throw new \Exception('Request GetCapabilities failed');
        }

        $doc = new \DOMDocument();
        $loaded = $doc->loadXML($response->getContent());
        if (!$loaded) {
            throw new \Exception('Parsing GetCapabilities failed');
        }

        $featureTypeList = $doc->getElementsByTagName('FeatureTypeList')[0];
        $featureTypes = $featureTypeList->childNodes;

        $index = $featureTypes->count() - 1;
        while ($index >= 0) {
            $child = $featureTypes->item($index);
            $name = $child->getElementsByTagName('Name')[0]->textContent;

            $found = false;
            foreach ($layerNames as $layerName) {
                if (preg_match("/^$layerName:/", $name)) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $featureTypeList->removeChild($child);
            }
            --$index;
        }

        return $doc->saveXML();
    }

    private function filterWMSCapabilities(string $datastoreId, mixed $endpoint, string $url): string
    {
        $allOfferings = $this->configurationApiService->getAllOfferings($datastoreId, ['endpoint' => $endpoint['_id']]);

        // Les couches liees aux offerings
        $layerNames = [];
        foreach ($allOfferings as $offering) {
            $layerNames[] = $offering['layer_name'];
        }

        $getCapUrl = $this->getGetCapUrl($endpoint['urls'][0]['url'], $url, 'WMS');

        $response = $this->httpClient->request('GET', $getCapUrl);
        if (JsonResponse::HTTP_OK != $response->getStatusCode()) {
            throw new \Exception('Request GetCapabilities failed');
        }

        $doc = new \DOMDocument();
        $loaded = $doc->loadXML($response->getContent());
        if (!$loaded) {
            throw new \Exception('Parsing GetCapabilities failed');
        }

        $cap = $doc->getElementsByTagName('Capability');
        $layers = $cap[0]?->getElementsByTagName('Layer')[0]?->getElementsByTagName('Layer');

        $index = $layers->count() - 1;
        while ($index >= 0) {
            $child = $layers->item($index);
            $name = $child->getElementsByTagName('Name')[0]->textContent;

            if (!in_array($name, $layerNames)) {
                $child->remove();
            }
            --$index;
        }

        return $doc->saveXML();
    }

    private function filterWMTSCapabilities(string $datastoreId, mixed $endpoint, string $url): string
    {
        $allOfferings = $this->configurationApiService->getAllOfferings($datastoreId, ['endpoint' => $endpoint['_id']]);

        $layerNames = [];
        foreach ($allOfferings as $offering) {
            $layerNames[] = $offering['layer_name'];
        }

        $endpointUrl = array_values(array_filter($endpoint['urls'], fn ($url) => 'WMTS' === $url['type']))[0] ?? null;
        if (null === $endpointUrl) {
            throw new \Exception('Endpoint URL not found');
        }

        $getCapUrl = $this->getGetCapUrl($endpointUrl['url'], $url, 'WMTS');

        $response = $this->httpClient->request('GET', $getCapUrl);
        if (JsonResponse::HTTP_OK != $response->getStatusCode()) {
            throw new \Exception('Request GetCapabilities failed');
        }

        $doc = new \DOMDocument();
        $loaded = $doc->loadXML($response->getContent());
        if (!$loaded) {
            throw new \Exception('Parsing GetCapabilities failed');
        }

        $contents = $doc->getElementsByTagName('Contents');
        $layers = $contents[0]?->getElementsByTagName('Layer');

        $index = $layers->count() - 1;
        while ($index >= 0) {
            $child = $layers->item($index);
            $name = $child->getElementsByTagName('Identifier')[0]->textContent;

            if (!in_array($name, $layerNames)) {
                $child->remove();
            }
            --$index;
        }

        return $doc->saveXML();
    }

    private function getServiceVersion(string $url): string
    {
        $res = [];

        $parsed = parse_url($url);
        parse_str($parsed['query'], $res);

        return $res['version'];
    }
}
