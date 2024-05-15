<?php

namespace App\Services;

use App\Constants\EntrepotApi\CommonTags;
use Symfony\Component\Filesystem\Filesystem;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Constants\EntrepotApi\ConfigurationTypes;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Services\EntrepotApi\ConfigurationApiService;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

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
     * ou supprimé
     *
     * @param string $datastoreId
     * @param string $offeringId
     * @return void
     */
    /*public function createOrUpdate(string $datastoreId, string $offeringId)
    {
        $capsPath = $this->parameterBag->get('capabilities_path');
        if (!$this->fs->exists($capsPath)) {
            $this->fs->mkdir($capsPath);
        }

        $datastore = $this->datastoreApiService->get($datastoreId);
        $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
        $configuration = $this->configurationApiService->get($datastoreId, $offering['configuration']['_id']);

        // Recherche du endpoint
        $endpoint = null;
        foreach ($datastore['endpoints'] as $ep) {
            if ($ep['endpoint']['_id'] == $offering['endpoint']['_id']) {
                $endpoint = $ep['endpoint'];
                break;
            }
        }

        $allOfferings = $this->configurationApiService->getAllOfferings($datastoreId, ['type' => $endpoint['type']]);

        // TODO Les autres (WMS-VECTOR, TMS ...)
        $xmlStr = null;
        switch ($endpoint['type']) {
            case 'WFS':
                // TODO
                //$xmlStr = $this->filterWFSCapabilities($endpoint, $offering, $allOfferings);
                break;

            default: break;
        }

        $uuid = uniqid();
        $filePath = join(DIRECTORY_SEPARATOR, [realpath($capsPath), "capabilities-$uuid.xml"]);

        // Creation du fichier
        file_put_contents($filePath, $xmlStr);

        // On regarde s'il existe deja un fichier avec ce path
        $path = join('/', [$endpoint['technical_name'], 'capabilities.xml']);

        $annexes = $this->annexeApiService->getAll($datastoreId, null, $path);
        if (count($annexes)) {  // Il existe, on le met a jour
            $this->annexeApiService->replaceFile($datastoreId, $annexes[0]['_id'], $filePath);
        } else {
            $label = CommonTags::DATASHEET_NAME.'='.$configuration['tags'][CommonTags::DATASHEET_NAME];
            $this->annexeApiService->add($datastoreId, $filePath, [$path], [$label]);
        }
    } */

    /**
     * Creation ou mise a jour de l'annexe capabilities lorsque d'un service est ajouté, mis à jour
     * ou supprimé
     *
     * @param string $datastoreId
     * @param array<mixed> $endpoint
     * @param string $url
     * @return array | null
     */
    public function createOrUpdate(string $datastoreId, array $endpoint, string $url) : array | null {
        $capsPath = $this->parameterBag->get('capabilities_path');
        if (!$this->fs->exists($capsPath)) {
            $this->fs->mkdir($capsPath);
        }

        // Endpoint privé, on sort
        if (! $endpoint['open']) {
            return null;
        }

        if (! in_array($endpoint['type'], [ConfigurationTypes::WFS, ConfigurationTypes::WMSVECTOR])) {
            return null;
        }

        $allOfferings = $this->configurationApiService->getAllOfferings($datastoreId, ['endpoint' => $endpoint['_id']]);

        $xmlStr = null;
        switch ($endpoint['type']) {
            case ConfigurationTypes::WFS:
                $xmlStr = $this->filterWFSCapabilities($endpoint, $url, $allOfferings);
                break;
            case ConfigurationTypes::WMSVECTOR:
                $xmlStr = $this->filterWMSCapabilities($endpoint, $url, $allOfferings);
                break;
            default: break;
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

    private function filterWFSCapabilities(mixed $endpoint, string $url, mixed $allOfferings): string
    {
        // Les couches liees aux offerings
        $layerNames = [];
        foreach ($allOfferings as $off) {
            $layerNames[] = $off['layer_name'];
        }

        $version = $this->getServiceVersion($url);
        $getCapUrl = $endpoint['urls'][0]['url'] . "?SERVICE=WFS&VERSION=$version&request=GetCapabilities";

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

    private function filterWMSCapabilities(mixed $endpoint, string $url, mixed $allOfferings): string
    {
        // Les couches liees aux offerings
        $layerNames = [];
        foreach ($allOfferings as $off) {
            $layerNames[] = $off['layer_name'];
        }

        $version = $this->getServiceVersion($url);
        $getCapUrl = $endpoint['urls'][0]['url'] . "?SERVICE=WMS&VERSION=$version&request=GetCapabilities";

        $response = $this->httpClient->request('GET', $getCapUrl);
        if (JsonResponse::HTTP_OK != $response->getStatusCode()) {
            throw new \Exception('Request GetCapabilities failed');
        }

        $doc = new \DOMDocument();
        $loaded = $doc->loadXML($response->getContent());
        if (!$loaded) {
            throw new \Exception('Parsing GetCapabilities failed');
        }

        $cap = $doc->getElementsByTagName("Capability");
        $layers = $cap[0]?->getElementsByTagName("Layer")[0]?->getElementsByTagName('Layer');

        $index = $layers->count() - 1;
        while ($index >= 0) {
            $child = $layers->item($index);
	        $name = $child->getElementsByTagName('Name')[0]->textContent;

            if (! in_array($name, $layerNames)) {
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