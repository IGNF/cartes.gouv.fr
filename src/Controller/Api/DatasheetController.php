<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\StoredDataTags;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Constants\EntrepotApi\UploadTags;
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
    public function getDatasheetList(
        string $datastoreId,
    ): JsonResponse {
        $uploads = $this->entrepotApiService->upload->getAllDetailed($datastoreId, [
            'sort' => 'date:desc',
        ]);

        $uploadDataNames = array_map(function ($upload) {
            if (isset($upload['tags'][StoredDataTags::DATA_NAME])) {
                return $upload['tags'][StoredDataTags::DATA_NAME];
            }
        }, $uploads);

        $storedDataList = $this->entrepotApiService->storedData->getAllDetailed($datastoreId, [
            'sort' => 'date:desc',
        ]);

        $storedDataDataNames = array_map(function ($storedData) {
            if (isset($storedData['tags'][StoredDataTags::DATA_NAME])) {
                return $storedData['tags'][StoredDataTags::DATA_NAME];
            }
        }, $storedDataList);

        $uniqueDataNames = array_unique(array_merge($uploadDataNames, $storedDataDataNames));
        $uniqueDataNames = array_filter($uniqueDataNames);
        $uniqueDataNames = array_values($uniqueDataNames);

        $dataList = [];

        foreach ($uniqueDataNames as $datasheetName) {
            $dataList[] = $this->getBasicInfo($datastoreId, $datasheetName);
        }

        return $this->json($dataList);
    }

    #[Route('/{datasheetName}', name: 'get', methods: ['GET'])]
    public function getDetailed(string $datastoreId, string $datasheetName): JsonResponse
    {
        $uploadList = $this->entrepotApiService->upload->getAllDetailed($datastoreId, [
            'tags' => [
                UploadTags::DATA_NAME => $datasheetName,
            ],
        ]);

        $vectorDbList = $this->entrepotApiService->storedData->getAllDetailed($datastoreId, [
            'type' => StoredDataTypes::VECTOR_DB,
            'tags' => [
                StoredDataTags::DATA_NAME => $datasheetName,
            ],
        ]);

        // TODO : pyramid vector

        // TODO : configurations et offerings

        $data = $this->getBasicInfo($datastoreId, $datasheetName);

        return $this->json([
            ...$data,
            'vector_db_list' => $vectorDbList,
            'upload_list' => $uploadList,
        ]);
    }

    private function getBasicInfo(string $datastoreId, string $datasheetName): array
    {
        $nbPublications = 0;
        $configurations = $this->entrepotApiService->configuration->getAll($datastoreId, [
            'tags' => [
                StoredDataTags::DATA_NAME => $datasheetName,
            ],
        ]);

        foreach ($configurations as $configuration) {
            if (isset($configuration['status']) && ConfigurationStatuses::PUBLISHED === $configuration['status']) {
                ++$nbPublications;
            }
        }

        return [
            StoredDataTags::DATA_NAME => $datasheetName,
            'date' => new \DateTime(),
            'categories' => $this->getRandomCategories(), // TODO : temporaire
            'nb_publications' => $nbPublications,
        ];
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
