<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\StaticFileTypes;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/offerings',
    name: 'cartesgouvfr_api_service_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class ServiceController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('', name: 'get_offerings', methods: ['GET'])]
    public function getOfferings(string $datastoreId): JsonResponse
    {
        try {
            $offerings = $this->entrepotApiService->configuration->getAllOfferings($datastoreId);

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

            // TODO PEUT ETRE PROVISOIRE 
            $styles = $this->_getStyles($datastoreId, $offering['configuration']['_id']);
            $offering['configuration']['styles'] = $styles;

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

    /**
     * Recherche des styles et ajout de l'url
     *
     * @param string $datastoreId
     * @param string $configId
     * @return array<mixed>
     */
    private function _getStyles(string $datastoreId, string $configId) : array
    {
        $path = "/configuration/$configId/styles.json";
        $styleAnnexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, $path);
            
        $styles = [];
        if (count($styleAnnexes)) {
            $content = $this->entrepotApiService->annexe->download($datastoreId, $styleAnnexes[0]['_id']);
            $styles = json_decode($content, true);    
        }
        
        // Ajout des urls
        foreach($styles as &$style) {
            foreach($style['layers'] as &$layer) {
                $annexe = $this->entrepotApiService->annexe->get($datastoreId, $layer['annexe_id']);
                $layer['url'] = $annexe['paths'][0];
            }    
        }

        return $styles;
    }
}
