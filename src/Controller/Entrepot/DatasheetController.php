<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\MetadataApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\EntrepotApi\UploadApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/datasheet',
    name: 'cartesgouvfr_api_datasheet_',
    options: ['expose' => true],
    // condition: 'request.isXmlHttpRequest()'
)]
class DatasheetController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private UploadApiService $uploadApiService,
        private StoredDataApiService $storedDataApiService,
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private AnnexeApiService $annexeApiService,
        private CartesServiceApiService $cartesServiceApiService,
        private MetadataApiService $metadataApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getDatasheetList(string $datastoreId): JsonResponse
    {
        $uploads = $this->uploadApiService->getAll($datastoreId, [
            'sort' => 'lastEvent,desc',
            'fields' => 'tags',
        ]);

        $uploadDatasheetNames = array_map(function ($upload) {
            if (isset($upload['tags'][CommonTags::DATASHEET_NAME])) {
                return $upload['tags'][CommonTags::DATASHEET_NAME];
            }
        }, $uploads);

        $storedDataList = $this->storedDataApiService->getAll($datastoreId, [
            'sort' => 'lastEvent,desc',
            'fields' => 'tags',
        ]);

        $storedDataDatasheetNames = array_map(function ($storedData) {
            if (isset($storedData['tags'][CommonTags::DATASHEET_NAME])) {
                return $storedData['tags'][CommonTags::DATASHEET_NAME];
            }
        }, $storedDataList);

        $metadataList = $this->metadataApiService->getAll($datastoreId);

        $metadataDatasheetNames = array_map(function ($apiMetadata) {
            if (isset($apiMetadata['tags'][CommonTags::DATASHEET_NAME])) {
                return $apiMetadata['tags'][CommonTags::DATASHEET_NAME];
            }
        }, $metadataList);

        $uniqueDatasheetNames = array_unique(array_merge($uploadDatasheetNames, $storedDataDatasheetNames, $metadataDatasheetNames));
        $uniqueDatasheetNames = array_filter($uniqueDatasheetNames);
        $uniqueDatasheetNames = array_values($uniqueDatasheetNames);

        $datasheetList = [];

        $datastore = $this->datastoreApiService->get($datastoreId);

        foreach ($uniqueDatasheetNames as $datasheetName) {
            $datasheetList[] = $this->getBasicInfo($datastore, $datasheetName);
        }

        return $this->json($datasheetList);
    }

    #[Route('/{datasheetName}', name: 'get', methods: ['GET'])]
    public function getDetailed(string $datastoreId, string $datasheetName): JsonResponse
    {
        // recherche d'entités API qui représente une fiche de données : upload, stored_data, metadata
        $uploadList = $this->uploadApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
            'fields' => ['name', 'description', 'type', 'visibility', 'status', 'srs', 'contact', 'size', 'last_event', 'tags', 'bbox'],
        ]);

        $storedDataList = $this->storedDataApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
            'fields' => ['name', 'description', 'type', 'visibility', 'status', 'srs', 'contact', 'size', 'last_event', 'tags', 'bbox'],
        ]);

        $vectorDbList = array_filter($storedDataList, function ($storedData) {
            return StoredDataTypes::VECTOR_DB === $storedData['type'];
        });
        $vectorDbList = array_values($vectorDbList);

        // Pyramid vector
        $pyramidList = array_filter($storedDataList, function ($storedData) {
            return StoredDataTypes::ROK4_PYRAMID_VECTOR === $storedData['type'];
        });
        $pyramidList = array_values($pyramidList);

        $metadataList = $this->metadataApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        if (0 === count($uploadList) && 0 === count($vectorDbList) && 0 === count($pyramidList) && 0 === count($metadataList)) {
            throw new CartesApiException("La fiche de donnée [$datasheetName] n'existe pas", Response::HTTP_NOT_FOUND);
        }

        $datastore = $this->datastoreApiService->get($datastoreId);
        $datasheet = $this->getBasicInfo($datastore, $datasheetName);

        // Recherche de services (configuration et offering)
        $storedDataList = array_merge($vectorDbList, $pyramidList);
        // $services = $this->_getServices($datastoreId, $storedDataList);
        $services = [];

        return $this->json([
            ...$datasheet,
            'vector_db_list' => $vectorDbList,
            'pyramid_list' => $pyramidList,
            'upload_list' => $uploadList,
            'service_list' => $services,
        ]);
    }

    #[Route('/{datasheetName}/services', name: 'get_services', methods: ['GET'])]
    public function getServices(string $datastoreId, string $datasheetName): JsonResponse
    {
        $storedDataList = $this->storedDataApiService->getAllDetailed($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $services = $this->_getServices($datastoreId, $storedDataList);

        return $this->json($services);
    }

    /**
     * @param array<mixed> $datastore
     */
    private function getBasicInfo(array $datastore, string $datasheetName): array
    {
        // recherche du nombre de services publiés
        $configurations = $this->configurationApiService->getAll($datastore['_id'], [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
            'status' => ConfigurationStatuses::PUBLISHED,
        ]);
        $nbPublications = count($configurations);

        // recherche de vignette
        $annexeUrl = $this->getParameter('annexes_url');
        $annexes = $this->annexeApiService->getAll($datastore['_id'], null, null, ["datasheet_name=$datasheetName", 'type=thumbnail']);

        $thumbnail = null;
        if (count($annexes) > 0) {
            $thumbnail = $annexes[0];
            $thumbnail['url'] = $annexeUrl.'/'.$datastore['technical_name'].$thumbnail['paths'][0];
        }

        return [
            'name' => $datasheetName,
            'nb_publications' => $nbPublications,
            'thumbnail' => $thumbnail,
        ];
    }

    /**
     * Récupère les services (offerings) de la fiche de données.
     *
     * @param mixed[] $storedDataList
     */
    private function _getServices(string $datastoreId, array $storedDataList): array
    {
        $offerings = [];

        foreach ($storedDataList as $storedData) {
            $tmpOfferings = $this->configurationApiService->getAllOfferings($datastoreId, [
                'stored_data' => $storedData['_id'],
            ]);
            $offerings = array_merge($offerings, $tmpOfferings);
        }

        foreach ($offerings as &$offering) {
            $offering = $this->cartesServiceApiService->getService($datastoreId, $offering['_id']);
        }

        return $offerings;
    }

    #[Route('/{datasheetName}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $datasheetName): Response
    {
        try {
            $datasheet = json_decode($this->getDetailed($datastoreId, $datasheetName)->getContent(), true);

            // suppr des services (config et offering)
            if (isset($datasheet['service_list'])) {
                foreach ($datasheet['service_list'] as $offering) {
                    $this->cartesServiceApiService->unpublish($datastoreId, $offering['_id']);
                }
            }

            // suppr des uploads
            if (isset($datasheet['upload_list'])) {
                foreach ($datasheet['upload_list'] as $upload) {
                    $this->uploadApiService->remove($datastoreId, $upload['_id']);
                }
            }

            // suppr des stored_data
            $storedDataList = [];

            if (isset($datasheet['vector_db_list'])) {
                $storedDataList = array_merge($storedDataList, $datasheet['vector_db_list']);
            }

            if (isset($datasheet['pyramid_list'])) {
                $storedDataList = array_merge($storedDataList, $datasheet['pyramid_list']);
            }

            foreach ($storedDataList as $storedData) {
                $this->storedDataApiService->remove($datastoreId, $storedData['_id']);
            }

            // suppr des métadonnées
            $metadataList = $this->metadataApiService->getAll($datastoreId, [
                'tags' => [
                    CommonTags::DATASHEET_NAME => $datasheetName,
                ],
            ]);

            if (count($metadataList) > 0) {
                $metadata = $metadataList[0];

                foreach ($metadata['endpoints'] as $metadataEndpoint) {
                    $this->metadataApiService->unpublish($datastoreId, $metadata['file_identifier'], $metadataEndpoint['_id']);
                }

                $this->metadataApiService->delete($datastoreId, $metadata['_id']);
            }

            // TODO : autres données à supprimer
            // Suppression des annexes
            $annexes = $this->annexeApiService->getAll($datastoreId, null, null, ["datasheet_name=$datasheetName"]);
            foreach ($annexes as $annexe) {
                $this->annexeApiService->remove($datastoreId, $annexe['_id']);
            }

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
