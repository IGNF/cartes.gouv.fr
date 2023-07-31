<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\StoredDataTags;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Constants\EntrepotApi\UploadTags;
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
class DatasheetController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getDatasheetList(string $datastoreId): JsonResponse
    {
        $uploads = $this->entrepotApiService->upload->getAllDetailed($datastoreId, [
            'sort' => 'date:desc',
        ]);

        $uploadDatasheetNames = array_map(function ($upload) {
            if (isset($upload['tags'][StoredDataTags::DATASHEET_NAME])) {
                return $upload['tags'][StoredDataTags::DATASHEET_NAME];
            }
        }, $uploads);

        $storedDataList = $this->entrepotApiService->storedData->getAllDetailed($datastoreId, [
            'sort' => 'date:desc',
        ]);

        $storedDataDatasheetNames = array_map(function ($storedData) {
            if (isset($storedData['tags'][StoredDataTags::DATASHEET_NAME])) {
                return $storedData['tags'][StoredDataTags::DATASHEET_NAME];
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
                UploadTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $vectorDbList = $this->entrepotApiService->storedData->getAllDetailed($datastoreId, [
            'type' => StoredDataTypes::VECTOR_DB,
            'tags' => [
                StoredDataTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        // TODO : pyramid vector

        if (0 === count($uploadList) && 0 === count($vectorDbList)) {
            throw new CartesApiException("La fiche de donnée [$datasheetName] n'existe pas", Response::HTTP_NOT_FOUND);
        }

        $data = $this->getBasicInfo($datastoreId, $datasheetName);

        // recherche de services (configuration et offering)
        $storedDataList = array_merge($vectorDbList/* autres données */);
        $services = $this->getServices($datastoreId, $storedDataList);

        return $this->json([
            ...$data,
            'vector_db_list' => $vectorDbList,
            'upload_list' => $uploadList,
            'service_list' => $services,
        ]);
    }

    private function getBasicInfo(string $datastoreId, string $datasheetName): array
    {
        $nbPublications = 0;
        $configurations = $this->entrepotApiService->configuration->getAll($datastoreId, [
            'tags' => [
                StoredDataTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        foreach ($configurations as $configuration) {
            if (isset($configuration['status']) && ConfigurationStatuses::PUBLISHED === $configuration['status']) {
                ++$nbPublications;
            }
        }

        return [
            'name' => $datasheetName,
            'date' => new \DateTime(),
            'categories' => $this->getRandomCategories(), // TODO : temporaire
            'nb_publications' => $nbPublications,
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

    // TODO : à supprimer
    private function getRandomCategories(): array
    {
        $categories = [];
        $n = random_int(1, 3);

        for ($i = 1; $i <= $n; ++$i) {
            $categories[] = "Catégorie {$i}";
        }

        return $categories;
    }

    #[Route('/{datasheetName}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $datasheetName): Response
    {
        try {
            $data = json_decode($this->getDetailed($datastoreId, $datasheetName)->getContent(), true);

            if (isset($data['upload_list'])) {
                foreach ($data['upload_list'] as $upload) {
                    $this->entrepotApiService->upload->remove($datastoreId, $upload['_id']);
                }
            }

            $storedDataList = [];

            if (isset($data['vector_db_list'])) {
                $storedDataList = array_merge($storedDataList, $data['vector_db_list']);
            }

            foreach ($storedDataList as $storedData) {
                $this->entrepotApiService->storedData->remove($datastoreId, $storedData['_id']);
            }

            // TODO : autres données à supprimer

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (EntrepotApiException $ex) {
            return $this->json([
                'error' => $ex->getMessage(),
                'error_details' => $ex->getDetails(),
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}
