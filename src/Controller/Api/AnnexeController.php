<?php

namespace App\Controller\Api;

use Symfony\Component\Uid\Uuid;
use App\Services\EntrepotApiService;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Constants\EntrepotApi\CommonTags;
use PHPMD\Renderer\JSONRenderer;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[Route(
    '/api/datastore/{datastoreId}/annexe',
    name: 'cartesgouvfr_api_annexe_'
)]
class AnnexeController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService,
        private ParameterBagInterface $parameterBag,
        private HttpClientInterface $httpClient,
    ) {
        $this->httpClient = $httpClient->withOptions([
            'proxy' => $parameterBag->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    #[Route('/thumbnail_add', name: 'thumbnail_add', methods: ['POST'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function addThumbnail(string $datastoreId, Request $request) : JsonResponse{
        try {
            $datastore = $this->entrepotApiService->datastore->get($datastoreId);
            $annexeUrl = $this->parameterBag->get('annexes_url');

            $uuid = Uuid::v4();
            
            $file = $request->files->get('file');
            $extension = $file->getClientOriginalExtension();
            $path = join('/', ['thumbnail', "$uuid.$extension"]);

            $labels = [
                CommonTags::DATASHEET_NAME . '=' .$request->request->get("datasheetName"),
                'type=thumbnail'
            ];

            // On regarde s'il existe deja une vignette
            $annexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, null, $labels);

            if (count($annexes)) {  // Il existe, on la supprime sinon le path ne change pas
                $this->entrepotApiService->annexe->remove($datastoreId, $annexes[0]['_id']); // Sinon le path ne change pas
            }
            
            $annexe = $this->entrepotApiService->annexe->add($datastoreId, $file->getRealPath(), [$path], $labels);
            $annexe['url'] = $annexeUrl . '/' . $datastore['technical_name'] . $annexe['paths'][0];

            return new JsonResponse($annexe);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/thumbnail_remove/{annexeId}', name: 'thumbnail_remove', methods: ['DELETE'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function removeThumbnail(string $datastoreId, string $annexeId) : JsonResponse {
        try {
            $this->entrepotApiService->annexe->remove($datastoreId, $annexeId);
            return new JsonResponse();
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/capabilities_add/{offeringId}', name: 'capabilities_add', methods: ['GET'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function addCapabilities(string $datastoreId, string $offeringId): JsonResponse {
        try {
            $fs = new Filesystem();

            $capsPath = $this->parameterBag->get('capabilities_path');
            if (! $fs->exists($capsPath)) {
                $fs->mkdir($capsPath);
            }

            $datastore      = $this->entrepotApiService->datastore->get($datastoreId);
            $offering       = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
            $configuration  = $this->entrepotApiService->configuration->get($datastoreId, $offering['configuration']['_id']);

            // Recherche du endpoint
            $endpoint = null;
            foreach($datastore['endpoints'] as $ep) {
                if ($ep['endpoint']['_id'] == $offering['endpoint']['_id']) {
                    $endpoint = $ep['endpoint'];
                    break;
                }
            }
            
            $allOfferings = $this->entrepotApiService->configuration->getAllOfferings($datastoreId, ['type' => $endpoint['type']]);

            // TODO Les autres (WMS-VECTOR, TMS ...)
            $xmlStr = null;
            switch($endpoint['type']) {
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
            $path = join("/", [$endpoint['technical_name'], 'capabilities.xml']);

            $annexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, $path);
            if (count($annexes)) {  // Il existe, on le met a jour
                $this->entrepotApiService->annexe->replaceFile($datastoreId, $annexes[0]['_id'], $filePath);
            } else {
                $label = CommonTags::DATASHEET_NAME . '=' . $configuration['tags'][CommonTags::DATASHEET_NAME];
                $this->entrepotApiService->annexe->add($datastoreId, $filePath, [$path], [$label]);
            }

            return new JsonResponse("C'est la fête");   // TODO
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function filterWFSCapabilities(mixed $endpoint, mixed $offering, mixed $allOfferings) : string {
        // Les couches liees aux offerings
        $layerNames = [];
        foreach($allOfferings as $off) {
            $layerNames[] = $off["layer_name"];
        }

        $version = $this->getWFSVersion($offering['urls'][0]['url']);

        $url = $endpoint['urls'][0]['url'];
        $getCapUrl = "$url?SERVICE=WFS&VERSION=$version&request=GetCapabilities";
        
        $response = $this->httpClient->request("GET", $getCapUrl);
        if ($response->getStatusCode() != JsonResponse::HTTP_OK) {
            throw new \Exception("Request GetCapabilities failed");
        }

        $doc = new \DOMDocument; 
        $loaded = $doc->loadXML($response->getContent());
        if (! $loaded) {
            throw new \Exception("Parsing GetCapabilities failed");
        }

        $featureTypeList = $doc->getElementsByTagName("FeatureTypeList")[0];
        $featureTypes = $featureTypeList->childNodes;

        $index = $featureTypes->count() - 1;
        while($index >=0) {
            $child = $featureTypes->item($index);
            $name = $child->getElementsByTagName("Name")[0]->textContent;
            
            $found = false;
            foreach($layerNames as $layerName) {
                if (preg_match("/^$layerName:/", $name)) {
                    $found = true;
                    break;    
                }
            }
            if (! $found) {
                $featureTypeList->removeChild($child);
            }
            $index--;
        }

        return $doc->saveXML();
    }

    private function getWFSVersion(string $url) : string{
        $res = [];
        
        $parsed = parse_url($url);
        parse_str($parsed['query'], $res);
        return $res['version'];
    }
}