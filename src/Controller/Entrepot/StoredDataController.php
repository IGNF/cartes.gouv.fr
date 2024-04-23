<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\ProcessingStatuses;
use App\Constants\EntrepotApi\StoredDataStatuses;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\CartesServiceApi;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\EntrepotApi\UploadApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
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
        private StoredDataApiService $storedDataApiService,
        private ConfigurationApiService $configurationApiService,
        private ProcessingApiService $processingApiService,
        private UploadApiService $uploadApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getStoredDataList(
        string $datastoreId,
        #[MapQueryParameter] ?string $type = null,
    ): JsonResponse {
        try {
            $query = [];
            if (null !== $type) {
                $query['type'] = $type;
            }

            $storedDataList = $this->storedDataApiService->getAllDetailed($datastoreId, $query);

            return $this->json($storedDataList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{storedDataId}', name: 'get', methods: ['GET'])]
    public function getStoredData(string $datastoreId, string $storedDataId): JsonResponse
    {
        try {
            $storedData = $this->storedDataApiService->get($datastoreId, $storedDataId);

            return $this->json($storedData);
        } catch (ApiException $ex) {
            if (Response::HTTP_NOT_FOUND === $ex->getStatusCode()) {
                throw new CartesApiException("La donnée stockée [$storedDataId] n'existe pas", $ex->getStatusCode(), $ex->getDetails());
            } elseif (Response::HTTP_BAD_REQUEST === $ex->getStatusCode()) {
                throw new CartesApiException("L'identifiant de la donnée stockée [$storedDataId] est invalide", $ex->getStatusCode(), $ex->getDetails());
            }
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{storedDataId}/uses', name: 'get_uses', methods: ['GET'])]
    public function getUses(string $datastoreId, string $storedDataId): JsonResponse
    {
        try {
            $storedDataList = [];
            $offeringsList = [];

            $procExecList = $this->processingApiService->getAllExecutions($datastoreId, [
                'input_stored_data' => $storedDataId,
            ]);
            foreach ($procExecList as &$procExec) {
                if (ProcessingStatuses::SUCCESS === $procExec['status']) {
                    $procExec = $this->processingApiService->getExecution($datastoreId, $procExec['_id']);

                    if (isset($procExec['output']['stored_data']['status']) && StoredDataStatuses::DELETED !== $procExec['output']['stored_data']['status']) {
                        $storedDataList[] = $procExec['output']['stored_data'];
                    }
                }
            }

            $offeringsList = $this->configurationApiService->getAllOfferings($datastoreId, [
                'stored_data' => $storedDataId,
            ]);

            return $this->json([
                'stored_data_list' => $storedDataList,
                'offerings_list' => $offeringsList,
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{storedDataId}/report', name: 'get_report_data', methods: ['GET'])]
    public function getReport(string $datastoreId, string $storedDataId): JsonResponse
    {
        try {
            $storedData = $this->storedDataApiService->get($datastoreId, $storedDataId);

            // récupération de détails sur l'upload qui a servi à créer la stored_data
            $inputUpload = $this->uploadApiService->get($datastoreId, $storedData['tags']['upload_id']);
            $inputUpload['file_tree'] = $this->uploadApiService->getFileTree($datastoreId, $inputUpload['_id']);
            $inputUpload['checks'] = [];
            $uploadChecks = $this->uploadApiService->getCheckExecutions($datastoreId, $inputUpload['_id']);

            foreach ($uploadChecks as &$checkType) {
                foreach ($checkType as &$checkExecution) {
                    $checkExecution = array_merge($checkExecution, $this->uploadApiService->getCheckExecution($datastoreId, $checkExecution['_id']));
                    $checkExecution['logs'] = $this->uploadApiService->getCheckExecutionLogs($datastoreId, $checkExecution['_id']);
                    $inputUpload['checks'][] = $checkExecution;
                }
            }

            // récupération de l'exécution traitement (ou des exécutions, normalement y en a qu'une) qui a créé cette stored_data
            $procExecList = $this->processingApiService->getAllExecutions($datastoreId, [
                'output_stored_data' => $storedDataId,
            ]);

            foreach ($procExecList as &$procExec) {
                $procExec = array_merge($procExec, $this->processingApiService->getExecution($datastoreId, $procExec['_id']));
                $procExec['logs'] = $this->processingApiService->getExecutionLogs($datastoreId, $procExec['_id']);
            }

            return $this->json([
                'stored_data' => $storedData,
                'input_upload' => $inputUpload,
                'processing_executions' => $procExecList,
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{storedDataId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $storedDataId, CartesServiceApi $cartesServiceApi): JsonResponse
    {
        try {
            // Suppression des offerings et configurations associees
            $offerings = $this->configurationApiService->getAllOfferings($datastoreId, ['stored_data' => $storedDataId]);
            foreach ($offerings as $offering) {
                $cartesServiceApi->unpublish($datastoreId, $offering['_id']);
            }

            // Suppression de la donnee stockee
            $this->storedDataApiService->remove($datastoreId, $storedDataId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
