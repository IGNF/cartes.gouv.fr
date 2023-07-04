<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\StoredDataTags;
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
        /* private EntrepotApiService $entrepotApiService */
    ) {
    }

    #[Route('', name: 'get_list')]
    public function getDataList(/* string $datastoreId */): JsonResponse
    {
        // TODO : non fonctionnel pour le moment, l'API ignore les query params
        // $dataList = $this->entrepotApiService->storedData->getAll($datastoreId, [
        //     'sort' => 'date:desc',
        //     'tags' => [StoredDataTags::DATA_NAME],
        // ]);

        $dataList = $this->fakeDataList();

        return $this->json($dataList);
    }

    /**
     * @return mixed[]
     */
    private function fakeDataList(): array
    {
        $str = '[
            {
                "name": "TOUTES_MAILLES_BV_ETENDUES_gpkg_04-07-2023",
                "type": "VECTOR-DB",
                "visibility": "PRIVATE",
                "srs": "EPSG:2154",
                "_id": "e82d5499-c0c5-4930-a703-f11d9cc7cd7e",
                "data_name": "Donnée 1"
            },
            {
                "name": "TOUTES_MAILLES_BV_ETENDUES_gpkg_03-07-2023",
                "type": "VECTOR-DB",
                "visibility": "PRIVATE",
                "srs": "EPSG:2154",
                "_id": "adffa569-2096-4ae8-a2ac-2342adfdf90d",
                "data_name": "Donnée 2"
            },
            {
                "name": "TOUTES_MAILLES_BV_ETENDUES_gpkg_03-07-2023",
                "type": "VECTOR-DB",
                "visibility": "PRIVATE",
                "srs": "EPSG:2154",
                "_id": "e0489e61-b502-4826-8e96-9d0cc48916ce",
                "data_name": "Donnée 3"
            },
            {
                "name": "hydro-ardennes-l93_gpkg_04-07-2023",
                "type": "VECTOR-DB",
                "visibility": "PRIVATE",
                "srs": "EPSG:2154",
                "_id": "133725bb-9a0f-4979-afca-b981fbf31fac",
                "data_name": "Donnée 4"
            },
            {
                "name": "TOUTES_MAILLES_BV_ETENDUES_gpkg_04-07-2023",
                "type": "VECTOR-DB",
                "visibility": "PRIVATE",
                "srs": "EPSG:2154",
                "_id": "235152f5-a100-46e5-958f-0b1b952a05d7",
                "data_name": "Donnée 5"
            }
        ]';

        return json_decode($str, true);
    }
}
