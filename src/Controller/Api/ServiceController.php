<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\OfferingTypes;
use App\Constants\EntrepotApi\StaticFileTypes;
use App\Controller\StyleTrait;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route(
    '/api/datastores/{datastoreId}/offerings',
    name: 'cartesgouvfr_api_service_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class ServiceController extends AbstractController implements ApiControllerInterface
{
    use StyleTrait;

    private HttpClientInterface $httpClient;

    public function __construct(
        private EntrepotApiService $entrepotApiService,
        ParameterBagInterface $parameterBag,
        HttpClientInterface $httpClient
    ) {
        $this->httpClient = $httpClient->withOptions([
            'proxy' => $parameterBag->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
    }

    #[Route('', name: 'get_offerings_list', methods: ['GET'])]
    public function getOfferings(string $datastoreId, #[MapQueryParameter] bool $detailed = false): JsonResponse
    {
        try {
            if (true === $detailed) {
                $offerings = $this->entrepotApiService->configuration->getAllOfferingsDetailed($datastoreId);
            } else {
                $offerings = $this->entrepotApiService->configuration->getAllOfferings($datastoreId);
            }

            return $this->json($offerings);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'get_offering', methods: ['GET'])]
    public function getOffering(string $datastoreId, string $offeringId): JsonResponse
    {
        try {
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

            return $this->json($offering);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'wfs_unpublish', methods: ['DELETE'])]
    public function wfsUnpublish(string $datastoreId, string $offeringId): Response
    {
        try {
            $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
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

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'wmsvector_unpublish', methods: ['DELETE'])]
    public function wmsVectorUnpublish(string $datastoreId, string $offeringId): Response
    {
        try {
            $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
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

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'tms_unpublish', methods: ['DELETE'])]
    public function tmsUnpublish(string $datastoreId, string $offeringId): Response
    {
        try {
            $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
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

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
