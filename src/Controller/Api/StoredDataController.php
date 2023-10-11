<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\StoredDataTypes;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/stored_data',
    name: 'cartesgouvfr_api_stored_data_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class StoredDataController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/{storedDataId}', name: 'get', methods: ['GET'])]
    public function getStoredData(string $datastoreId, string $storedDataId): JsonResponse
    {
        try {
            $storedData = $this->entrepotApiService->storedData->get($datastoreId, $storedDataId);

            return $this->json($storedData);
        } catch (EntrepotApiException $ex) {
            if (Response::HTTP_NOT_FOUND === $ex->getStatusCode()) {
                throw new CartesApiException("La donnée stockée [$storedDataId] n'existe pas", $ex->getStatusCode(), $ex->getDetails());
            } elseif (Response::HTTP_BAD_REQUEST === $ex->getStatusCode()) {
                throw new CartesApiException("L'identifiant de la donnée stockée [$storedDataId] est invalide", $ex->getStatusCode(), $ex->getDetails());
            }
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{storedDataId}/report', name: 'get_report_data', methods: ['GET'])]
    public function getReport(string $datastoreId, string $storedDataId): JsonResponse
    {
        try {
            // commun à VECTOR-DB et ROK4-PYRAMID-VECTOR
            $storedData = $this->entrepotApiService->storedData->get($datastoreId, $storedDataId);

            // récupération de détails sur l'upload qui a servi à créer la stored_data
            $inputUpload = $this->entrepotApiService->upload->get($datastoreId, $storedData['tags']['upload_id']);
            $inputUpload['file_tree'] = $this->entrepotApiService->upload->getFileTree($datastoreId, $inputUpload['_id']);
            $inputUpload['checks'] = $this->entrepotApiService->upload->getCheckExecutions($datastoreId, $inputUpload['_id']);

            foreach ($inputUpload['checks'] as &$checkType) {
                foreach ($checkType as &$checkExecution) {
                    $checkExecution = array_merge($checkExecution, $this->entrepotApiService->upload->getCheckExecution($datastoreId, $checkExecution['_id']));
                    $checkExecution['logs'] = $this->entrepotApiService->upload->getCheckExecutionLogs($datastoreId, $checkExecution['_id']);
                }
            }

            $procIntegrationExec = $this->entrepotApiService->processing->getExecution($datastoreId, $storedData['tags']['proc_int_id']);
            $procIntegrationExec['logs'] = $this->entrepotApiService->processing->getExecutionLogs($datastoreId, $procIntegrationExec['_id']);

            // specifique à ROK4-PYRAMID-VECTOR
            if (StoredDataTypes::ROK4_PYRAMID_VECTOR == $storedData['type']) {
                $procPyramidCreationExec = $this->entrepotApiService->processing->getExecution($datastoreId, $storedData['tags']['proc_pyr_creat_id']);
                $procPyramidCreationExec['logs'] = $this->entrepotApiService->processing->getExecutionLogs($datastoreId, $procPyramidCreationExec['_id']);
            }

            return $this->json([
                'stored_data' => $storedData,
                'input_upload' => $inputUpload,
                'proc_int_exec' => $procIntegrationExec,
                'proc_pyr_creat_exec' => $procPyramidCreationExec ?? null,
            ]);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }
}
