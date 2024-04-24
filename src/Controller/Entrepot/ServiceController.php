<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\OfferingTypes;
use App\Controller\ApiControllerInterface;
use App\Entity\CswMetadata\CswHierarchyLevel;
use App\Entity\CswMetadata\CswLanguage;
use App\Entity\CswMetadata\CswMetadata;
use App\Entity\CswMetadata\CswMetadataLayer;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CswMetadataHelper;
use App\Services\EntrepotApi\CartesServiceApi;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\MetadataApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
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
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private CartesServiceApi $cartesServiceApi,
        private MetadataApiService $metadataApiService,
        private CswMetadataHelper $cswMetadataHelper,
    ) {
    }

    #[Route('', name: 'get_offerings_list', methods: ['GET'])]
    public function getOfferings(string $datastoreId, #[MapQueryParameter] bool $detailed = false): JsonResponse
    {
        try {
            if (true === $detailed) {
                $offerings = $this->configurationApiService->getAllOfferingsDetailed($datastoreId);
            } else {
                $offerings = $this->configurationApiService->getAllOfferings($datastoreId);
            }

            return $this->json($offerings);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'get_service', methods: ['GET'])]
    public function getService(string $datastoreId, string $offeringId): JsonResponse
    {
        try {
            $offering = $this->cartesServiceApi->getService($datastoreId, $offeringId);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'unpublish_service', methods: ['DELETE'])]
    public function unpublishService(string $datastoreId, string $offeringId): Response
    {
        try {
            $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $configuration = $this->configurationApiService->get($datastoreId, $offering['configuration']['_id']);

            $this->cartesServiceApi->unpublish($datastoreId, $offeringId);

            $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME];

            if ($datasheetName) {
                $metadataList = $this->metadataApiService->getAll($datastoreId, [
                    'tags' => [
                        CommonTags::DATASHEET_NAME => $datasheetName,
                    ],
                ]);

                if (count($metadataList) > 0) {
                    $apiMetadata = $metadataList[0];
                    $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id']);

                    $cswMetadata = $this->cswMetadataHelper->fromXml($apiMetadataXml);
                    $cswMetadata->layers = $this->getMetadataLayers($datastoreId, $datasheetName);

                    $xmlFilePath = $this->cswMetadataHelper->saveToFile($cswMetadata);
                    $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);
                }
            }

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    protected function getEndpointByShareType(string $datastoreId, string $configType, string $shareWith): array
    {
        // TODO : implémentation partielle, tous les partages ne sont pas couverts
        if ('all_public' === $shareWith) {
            $endpoints = $this->datastoreApiService->getEndpointsList($datastoreId, [
                'type' => $configType,
                'open' => true,
            ]);
        } elseif ('your_community' === $shareWith) {
            $endpoints = $this->datastoreApiService->getEndpointsList($datastoreId, [
                'type' => $configType,
                'open' => false,
            ]);
        } else {
            throw new CartesApiException('Valeur du champ [share_with] est invalide', Response::HTTP_BAD_REQUEST, ['share_with' => $shareWith]);
        }

        if (0 === count($endpoints)) {
            throw new CartesApiException("Aucun point d'accès (endpoint) du datastore ne peut convenir à la demande", Response::HTTP_BAD_REQUEST, ['share_with' => $shareWith]);
        }

        return $endpoints[0]['endpoint'];
    }

    /**
     * @param array<mixed> $formData
     */
    protected function createOrUpdateMetadata(array $formData, string $datastoreId, string $datasheetName): void
    {
        $metadataList = $this->metadataApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $metadataEndpoint = $this->getEndpointByShareType($datastoreId, 'METADATA', 'all_public');

        // apiMetadata : objet metadata issu de l'API Entrepot
        // cswMetadata : objet metadata issu du fichier lié à la metadata API

        if (0 === count($metadataList)) {
            // nouvelle métadonnée à créer

            $newCswMetadata = $this->getNewCswMetadata($formData, $datastoreId, $datasheetName);

            $newMetadataFilePath = $this->cswMetadataHelper->saveToFile($newCswMetadata);

            $newApiMetadata = $this->metadataApiService->add($datastoreId, $newMetadataFilePath);
            $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ]);

            $this->metadataApiService->publish($datastoreId, $newApiMetadata['file_identifier'], $metadataEndpoint['_id']);
        } else {
            // une métadonnée existe déjà qu'on va mettre à jour

            $oldApiMetadata = $metadataList[0];

            $oldMetadataFileXml = $this->metadataApiService->downloadFile($datastoreId, $oldApiMetadata['_id']);
            $oldCswMetadata = $this->cswMetadataHelper->fromXml($oldMetadataFileXml);

            $newCswMetadata = $this->getNewCswMetadata($formData, $datastoreId, $datasheetName);

            $newMetadataFilePath = $this->cswMetadataHelper->saveToFile($newCswMetadata);

            // suppression et recréation de métadonnées si changement de file_identifier
            if ($oldCswMetadata->fileIdentifier !== $newCswMetadata->fileIdentifier) {
                $this->metadataApiService->unpublish($datastoreId, $oldCswMetadata->fileIdentifier, $metadataEndpoint['_id']);
                $this->metadataApiService->delete($datastoreId, $oldApiMetadata['_id']);

                $newApiMetadata = $this->metadataApiService->add($datastoreId, $newMetadataFilePath);
            } else {
                $newApiMetadata = $this->metadataApiService->replaceFile($datastoreId, $oldApiMetadata['_id'], $newMetadataFilePath);
            }
            $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], $oldApiMetadata['tags']);

            if (0 === count($newApiMetadata['endpoints'])) {
                $this->metadataApiService->publish($datastoreId, $newApiMetadata['file_identifier'], $metadataEndpoint['_id']);
            }
        }
    }

    /**
     * @param array<mixed> $formData
     */
    protected function getNewCswMetadata(array $formData, string $datastoreId, string $datasheetName): CswMetadata
    {
        $layers = $this->getMetadataLayers($datastoreId, $datasheetName);

        $language = $formData['languages'][0] ?
             new CswLanguage($formData['languages'][0]['code'], $formData['languages'][0]['language'])
             : CswLanguage::default();

        return CswMetadata::createFromParams(
            $formData['identifier'],
            CswHierarchyLevel::from('' === $formData['resource_genealogy'] ? 'series' : $formData['resource_genealogy']),
            $language,
            $formData['charset'],
            $formData['public_name'],
            $formData['description'],
            $formData['creation_date'],
            $formData['category'],
            $formData['email_contact'],
            $formData['organization'],
            $formData['organization_email'],
            $layers
        );
    }

    /**
     * @return array<CswMetadataLayer>
     */
    protected function getMetadataLayers(string $datastoreId, string $datasheetName): array
    {
        $configurationsList = $this->configurationApiService->getAllDetailed($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $layers = [];

        foreach ($configurationsList as $configuration) {
            $configurationOfferings = $this->configurationApiService->getConfigurationOfferings($datastoreId, $configuration['_id']);

            if (count($configurationOfferings) > 0) {
                $offering = $configurationOfferings[0];
                $offering = $this->configurationApiService->getOffering($datastoreId, $offering['_id']);

                $serviceEndpoint = $this->datastoreApiService->getEndpoint($datastoreId, $offering['endpoint']['_id']);

                switch ($configuration['type']) {
                    case ConfigurationTypes::WFS:
                    case ConfigurationTypes::WMSVECTOR:
                        $subLayers = $this->getSubLayers($configuration, $offering, $serviceEndpoint['endpoint']['urls'][0]['url']);
                        $layers = array_merge($layers, $subLayers);
                        break;

                    case ConfigurationTypes::WMTSTMS:
                        $layerName = $offering['layer_name'];
                        $endpointType = 'OGC:TMS';

                        // dd($serviceEndpoint['endpoint']['urls']);
                        $tmsEndpoints = array_filter($serviceEndpoint['endpoint']['urls'], function (array $url) {
                            return 'TMS' === $url['type'];
                        });
                        $tmsEndpoints = array_values($tmsEndpoints);

                        if (count($tmsEndpoints) > 0) {
                            $layers[] = new CswMetadataLayer($layerName, $endpointType, $tmsEndpoints[0]['url'], $offering['_id']);
                        }

                        break;
                }
            }
        }

        return $layers;
    }

    /**
     * @param array<mixed> $configuration
     * @param array<mixed> $offering
     *
     * @return array<CswMetadataLayer>
     */
    private function getSubLayers(array $configuration, array $offering, string $serviceEndpointUrl): array
    {
        $configRelations = $configuration['type_infos']['used_data'][0]['relations'];

        $relationLayers = array_map(function ($relation) use ($offering, $serviceEndpointUrl) {
            $layerName = null;
            $endpointType = null;

            switch ($offering['type']) {
                case OfferingTypes::WFS:
                    $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['native_name']);
                    $endpointType = 'OGC:WFS';
                    break;

                case OfferingTypes::WMSVECTOR:
                    $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['name']);
                    $endpointType = 'OGC:WMS';
                    break;
            }

            return new CswMetadataLayer($layerName, $endpointType, $serviceEndpointUrl, $offering['_id']);
        }, $configRelations);

        return $relationLayers;
    }
}
