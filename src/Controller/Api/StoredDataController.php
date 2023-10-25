<?php

namespace App\Controller\Api;

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
class StoredDataController extends AbstractController implements ApiControllerInterface
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
            $storedData = $this->entrepotApiService->storedData->get($datastoreId, $storedDataId);

            // récupération de détails sur l'upload qui a servi à créer la stored_data
            $inputUpload = $this->entrepotApiService->upload->get($datastoreId, $storedData['tags']['upload_id']);
            $inputUpload['file_tree'] = $this->entrepotApiService->upload->getFileTree($datastoreId, $inputUpload['_id']);
            $inputUpload['checks'] = [];
            $uploadChecks = $this->entrepotApiService->upload->getCheckExecutions($datastoreId, $inputUpload['_id']);

            foreach ($uploadChecks as &$checkType) {
                foreach ($checkType as &$checkExecution) {
                    $checkExecution = array_merge($checkExecution, $this->entrepotApiService->upload->getCheckExecution($datastoreId, $checkExecution['_id']));
                    $checkExecution['logs'] = $this->entrepotApiService->upload->getCheckExecutionLogs($datastoreId, $checkExecution['_id']);
                    $inputUpload['checks'][] = $checkExecution;
                }
            }

            // récupération de l'exécution traitement (ou des exécutions, normalement y en a qu'une) qui a créé cette stored_data
            $procExecList = $this->entrepotApiService->processing->getAllExecutions($datastoreId, [
               'output_stored_data' => $storedDataId,
            ]);

            foreach ($procExecList as &$procExec) {
                $procExec = array_merge($procExec, $this->entrepotApiService->processing->getExecution($datastoreId, $procExec['_id']));
                $procExec['logs'] = $this->entrepotApiService->processing->getExecutionLogs($datastoreId, $procExec['_id']);
            }

            return $this->json([
                'stored_data' => $storedData,
                'input_upload' => $inputUpload,
                'processing_executions' => $procExecList,
            ]);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }
}
