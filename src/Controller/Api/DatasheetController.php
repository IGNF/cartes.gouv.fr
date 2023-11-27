<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/datasheet',
    name: 'cartesgouvfr_api_datasheet_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class DatasheetController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getDatasheetList(string $datastoreId): JsonResponse
    {
        $uploads = $this->entrepotApiService->upload->getAllDetailed($datastoreId, [
            'sort' => 'lastEvent,desc',
        ]);

        $uploadDatasheetNames = array_map(function ($upload) {
            if (isset($upload['tags'][CommonTags::DATASHEET_NAME])) {
                return $upload['tags'][CommonTags::DATASHEET_NAME];
            }
        }, $uploads);

        $storedDataList = $this->entrepotApiService->storedData->getAllDetailed($datastoreId, [
            'sort' => 'lastEvent,desc',
        ]);

        $storedDataDatasheetNames = array_map(function ($storedData) {
            if (isset($storedData['tags'][CommonTags::DATASHEET_NAME])) {
                return $storedData['tags'][CommonTags::DATASHEET_NAME];
            }
        }, $storedDataList);

        $uniqueDatasheetNames = array_unique(array_merge($uploadDatasheetNames, $storedDataDatasheetNames));
        $uniqueDatasheetNames = array_filter($uniqueDatasheetNames);
        $uniqueDatasheetNames = array_values($uniqueDatasheetNames);

        $datasheetList = [];

        foreach ($uniqueDatasheetNames as $datasheetName) {
            $datasheetList[] = $this->getBasicInfo($datastoreId, $datasheetName);
        }

        return $this->json($datasheetList);
    }

    #[Route('/{datasheetName}', name: 'get', methods: ['GET'])]
    public function getDetailed(string $datastoreId, string $datasheetName): JsonResponse
    {
        // recherche d'entités API qui représente une fiche de données : upload, stored_data
        $uploadList = $this->entrepotApiService->upload->getAllDetailed($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $vectorDbList = $this->entrepotApiService->storedData->getAllDetailed($datastoreId, [
            'type' => StoredDataTypes::VECTOR_DB,
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        // Pyramid vector
        $pyramidList = $this->entrepotApiService->storedData->getAllDetailed($datastoreId, [
            'type' => StoredDataTypes::ROK4_PYRAMID_VECTOR,
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        if (0 === count($uploadList) && 0 === count($vectorDbList) && 0 === count($pyramidList)) {
            throw new CartesApiException("La fiche de donnée [$datasheetName] n'existe pas", Response::HTTP_NOT_FOUND);
        }

        $data = $this->getBasicInfo($datastoreId, $datasheetName);

        // Recherche de services (configuration et offering)
        $storedDataList = array_merge($vectorDbList, $pyramidList);
        $services = $this->getServices($datastoreId, $storedDataList);

        return $this->json([
            ...$data,
            'vector_db_list' => $vectorDbList,
            'pyramid_list' => $pyramidList,
            'upload_list' => $uploadList,
            'service_list' => $services,
        ]);
    }

    private function getBasicInfo(string $datastoreId, string $datasheetName): array
    {
        $datastore = $this->entrepotApiService->datastore->get($datastoreId);

        $nbPublications = 0;
        $configurations = $this->entrepotApiService->configuration->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        foreach ($configurations as $configuration) {
            if (isset($configuration['status']) && ConfigurationStatuses::PUBLISHED === $configuration['status']) {
                ++$nbPublications;
            }
        }

        $annexeUrl = $this->getParameter('annexes_url');
        $annexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, null, ["datasheet_name=$datasheetName", 'type=thumbnail']);

        $thumbnail = null;
        if (1 == count($annexes)) {
            $thumbnail = $annexes[0];
            $thumbnail['url'] = $annexeUrl.'/'.$datastore['technical_name'].$thumbnail['paths'][0];
        }

        return [
            'name' => $datasheetName,
            'date' => new \DateTime(), // TODO : pour le moment on se sait pas ça correspond à la date de quoi
            'categories' => [],
            'nb_publications' => $nbPublications,
            'thumbnail' => $thumbnail,
        ];
    }

    /**
     * Récupère les services (offerings) de la fiche de données.
     *
     * @param mixed[] $storedDataList
     */
    private function getServices(string $datastoreId, array $storedDataList): array
    {
        $offerings = [];

        foreach ($storedDataList as $storedData) {
            $tmpOfferings = $this->entrepotApiService->configuration->getAllOfferingsDetailed($datastoreId, [
                'stored_data' => $storedData['_id'],
            ]);
            $offerings = array_merge($offerings, $tmpOfferings);
        }

        foreach ($offerings as &$offering) {
            $offering['configuration'] = $this->entrepotApiService->configuration->get($datastoreId, $offering['configuration']['_id']);
        }

        return $offerings;
    }

    #[Route('/{datasheetName}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $datasheetName): Response
    {
        try {
            $datasheet = json_decode($this->getDetailed($datastoreId, $datasheetName)->getContent(), true);

            if (isset($datasheet['service_list'])) {
                foreach ($datasheet['service_list'] as $offering) {
                    $this->entrepotApiService->configuration->removeOffering($datastoreId, $offering['_id']);
                    $configurationId = $offering['configuration']['_id'];

                    while (1) {
                        sleep(3);
                        $configuration = $this->entrepotApiService->configuration->get($datastoreId, $configurationId);
                        if (ConfigurationStatuses::UNPUBLISHED === $configuration['status']) {
                            break;
                        }
                    }
                    $this->entrepotApiService->configuration->remove($datastoreId, $configurationId);
                }
            }

            if (isset($datasheet['upload_list'])) {
                foreach ($datasheet['upload_list'] as $upload) {
                    $this->entrepotApiService->upload->remove($datastoreId, $upload['_id']);
                }
            }

            $storedDataList = [];

            if (isset($datasheet['vector_db_list'])) {
                $storedDataList = array_merge($storedDataList, $datasheet['vector_db_list']);
            }

            foreach ($storedDataList as $storedData) {
                $this->entrepotApiService->storedData->remove($datastoreId, $storedData['_id']);
            }

            // TODO : autres données à supprimer

            // Suppression des annexes
            $annexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, null, ["datasheet_name=$datasheetName"]);
            foreach ($annexes as $annexe) {
                $this->entrepotApiService->annexe->remove($datastoreId, $annexe['_id']);
            }

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
