<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\StoredDataTags;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/data',
    name: 'cartesgouvfr_api_data_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class DataController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('', name: 'get_list')]
    public function getDataList(
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

        foreach ($uniqueDataNames as $dataName) {
            $dataList[] = $this->getBasicInfo($datastoreId, $dataName);
        }

        return $this->json($dataList);
    }

    #[Route('/{dataName}', name: 'get')]
    public function getDetailed(string $datastoreId, string $dataName): JsonResponse
    {
        $vectorDbList = $this->entrepotApiService->storedData->getAllDetailed($datastoreId, [
            'type' => StoredDataTypes::VECTOR_DB,
            'tags' => [
                StoredDataTags::DATA_NAME => $dataName,
            ],
        ]);

        // TODO : pyramid vector

        // TODO configurations et offerings

        $data = $this->getBasicInfo($datastoreId, $dataName);

        return $this->json([
            ...$data,
            'vector_db_list' => $vectorDbList,
        ]);
    }

    private function getBasicInfo(string $datastoreId, string $dataName): array
    {
        $nbPublications = 0;
        $configurations = $this->entrepotApiService->configuration->getAll($datastoreId, [
            'tags' => [
                StoredDataTags::DATA_NAME => $dataName,
            ],
        ]);

        foreach ($configurations as $configuration) {
            if (isset($configuration['status']) && ConfigurationStatuses::PUBLISHED === $configuration['status']) {
                ++$nbPublications;
            }
        }

        return [
            StoredDataTags::DATA_NAME => $dataName,
            'date' => new \DateTime(),
            'categories' => $this->getRandomCategories(), // TODO : temporaire
            'nb_publications' => $nbPublications,
        ];
    }

    private function getRandomCategories(): array
    {
        $categories = [];
        $n = random_int(1, 3);

        for ($i = 1; $i <= $n; ++$i) {
            $categories[] = "Catégorie {$i}";
        }

        return $categories;
    }
}
