<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Uid\Uuid;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route(
    '/api/datastores/{datastoreId}/annexe',
    name: 'cartesgouvfr_api_annexe_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class AnnexeController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private AnnexeApiService $annexeApiService,
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private ParameterBagInterface $parameterBag,
        private HttpClientInterface $httpClient,
    ) {
        $this->httpClient = $httpClient->withOptions([
            'proxy' => $parameterBag->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getAnnexeList(string $datastoreId): JsonResponse
    {
        try {
            $annexeList = $this->annexeApiService->getAllDetailed($datastoreId);

            return $this->json($annexeList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/thumbnail_add', name: 'thumbnail_add', methods: ['POST'])]
    public function addThumbnail(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $datastore = $this->datastoreApiService->get($datastoreId);
            $annexeUrl = $this->parameterBag->get('annexes_url');

            $uuid = Uuid::v4();

            $file = $request->files->get('file');
            $extension = $file->getClientOriginalExtension();
            $path = join('/', ['thumbnail', "$uuid.$extension"]);

            $labels = [
                CommonTags::DATASHEET_NAME.'='.$request->request->get('datasheetName'),
                'type=thumbnail',
            ];

            // On regarde s'il existe deja une vignette
            $annexes = $this->annexeApiService->getAll($datastoreId, null, null, $labels);

            if (count($annexes)) {  // Elle existe, on la supprime sinon le path ne change pas
                $this->annexeApiService->remove($datastoreId, $annexes[0]['_id']);
            }

            $annexe = $this->annexeApiService->add($datastoreId, $file->getRealPath(), [$path], $labels);
            $annexe['url'] = $annexeUrl.'/'.$datastore['technical_name'].$annexe['paths'][0];

            return new JsonResponse($annexe);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{annexeId}', name: 'delete', methods: ['DELETE'])]
    public function deleteAnnexe(string $datastoreId, string $annexeId): JsonResponse
    {
        try {
            $this->annexeApiService->remove($datastoreId, $annexeId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/capabilities_add/{offeringId}', name: 'capabilities_add', methods: ['GET'])]
    public function addCapabilities(string $datastoreId, string $offeringId): JsonResponse
    {
        try {
            $fs = new Filesystem();

            $capsPath = $this->parameterBag->get('capabilities_path');
            if (!$fs->exists($capsPath)) {
                $fs->mkdir($capsPath);
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
                    $xmlStr = $this->filterWFSCapabilities($endpoint, $offering, $allOfferings);
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

            return new JsonResponse("C'est la fête");   // TODO
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function filterWFSCapabilities(mixed $endpoint, mixed $offering, mixed $allOfferings): string
    {
        // Les couches liees aux offerings
        $layerNames = [];
        foreach ($allOfferings as $off) {
            $layerNames[] = $off['layer_name'];
        }

        $version = $this->getWFSVersion($offering['urls'][0]['url']);

        $url = $endpoint['urls'][0]['url'];
        $getCapUrl = "$url?SERVICE=WFS&VERSION=$version&request=GetCapabilities";

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

    private function getWFSVersion(string $url): string
    {
        $res = [];

        $parsed = parse_url($url);
        parse_str($parsed['query'], $res);

        return $res['version'];
    }
}
