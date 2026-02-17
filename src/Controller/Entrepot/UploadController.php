<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\UploadTags;
use App\Constants\EntrepotApi\UploadTypes;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\UploadApiService;
use App\Workflow\UploadIntegrationWorkflow;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/upload',
    name: 'cartesgouvfr_api_upload_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[entrepot] upload')]
class UploadController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private UploadApiService $uploadApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getUploadList(
        string $datastoreId,
        #[MapQueryParameter] ?string $type = null,
    ): JsonResponse {
        try {
            $query = [];
            if (null !== $type) {
                $query['type'] = $type;
            }

            $uploadList = $this->uploadApiService->getAllDetailed($datastoreId, $query);

            return $this->json($uploadList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $content = json_decode($request->getContent(), true);

            // déclaration de livraison
            $uploadData = [
                'name' => $content['data_technical_name'],
                'description' => $content['data_technical_name'],
                'type' => UploadTypes::VECTOR,
                'srs' => $content['data_srid'],
            ];
            $upload = $this->uploadApiService->add($datastoreId, $uploadData);

            // ajout tags sur la livraison
            $tags = [
                UploadTags::DATA_UPLOAD_PATH => $content['data_upload_path'],
                CommonTags::DATASHEET_NAME => $content['data_name'],
                CommonTags::PRODUCER => $content['producer'],
                CommonTags::PRODUCTION_YEAR => $content['production_year'],
            ];
            $upload = $this->uploadApiService->addTags($datastoreId, $upload['_id'], $tags);

            // retourne l'upload au frontend, qui se chargera de lancer l'intégration VECTOR-DB
            return $this->json($upload);
        } catch (AppException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], $ex->getCode());
        }
    }

    #[Route('/{uploadId}', name: 'get', methods: ['GET'])]
    public function get(string $datastoreId, string $uploadId): JsonResponse
    {
        try {
            return $this->json($this->uploadApiService->get($datastoreId, $uploadId));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{uploadId}/file_tree', name: 'get_file_tree', methods: ['GET'])]
    public function getFileTree(string $datastoreId, string $uploadId): JsonResponse
    {
        try {
            $fileTree = $this->uploadApiService->getFileTree($datastoreId, $uploadId);

            return $this->json($fileTree);
        } catch (AppException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], $ex->getCode());
        }
    }

    #[Route('/{uploadId}/integration_progress', name: 'integration_progress', methods: ['GET'])]
    public function integrationProgress(
        string $datastoreId,
        string $uploadId,
        UploadIntegrationWorkflow $uploadIntegrationWorkflow,
        #[MapQueryParameter] bool $getOnlyProgress = false,
    ): JsonResponse {
        try {
            $upload = $this->uploadApiService->get($datastoreId, $uploadId);
            $progress = $uploadIntegrationWorkflow->computeProgress($datastoreId, $upload);

            if (false === $getOnlyProgress) {
                $uploadIntegrationWorkflow->advanceIfPossible($datastoreId, $upload, $progress);

                $upload = $this->uploadApiService->get($datastoreId, $uploadId);
                $progress = $uploadIntegrationWorkflow->computeProgress($datastoreId, $upload);
            }

            $currentStepIndex = $uploadIntegrationWorkflow->getCurrentStepIndex($progress);

            $progressJson = json_encode($progress);
            $stepString = (string) $currentStepIndex;
            $existingProgressJson = $upload['tags'][UploadTags::INTEGRATION_PROGRESS] ?? null;
            $existingStepString = isset($upload['tags'][UploadTags::INTEGRATION_CURRENT_STEP]) ? (string) $upload['tags'][UploadTags::INTEGRATION_CURRENT_STEP] : null;

            $uploadTags = [
                UploadTags::INTEGRATION_PROGRESS => $progressJson,
                UploadTags::INTEGRATION_CURRENT_STEP => $stepString,
            ];

            // mise à jour état des étapes de l'intégration uniquement si changement
            if ($existingProgressJson !== $progressJson || $existingStepString !== $stepString) {
                $this->uploadApiService->addTags($datastoreId, $uploadId, $uploadTags);
            }

            // supprime livraison si intégration terminée
            if (false === $getOnlyProgress && $uploadIntegrationWorkflow->isIntegrationCompleted($progress)) {
                $this->uploadApiService->remove($datastoreId, $uploadId);
            }

            return $this->json($uploadTags);
        } catch (ApiException|AppException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{uploadId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $uploadId): JsonResponse
    {
        try {
            $this->uploadApiService->remove($datastoreId, $uploadId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{uploadId}/upload-report', name: 'get_upload_report', methods: ['GET'])]
    public function getUploadReport(string $datastoreId, string $uploadId): JsonResponse
    {
        try {
            // Récupération des détails de l'upload ayant échoué
            $inputUpload = $this->uploadApiService->get($datastoreId, $uploadId);
            $inputUpload['file_tree'] = $this->uploadApiService->getFileTree($datastoreId, $inputUpload['_id']);
            $inputUpload['checks'] = [];
            $uploadChecks = $this->uploadApiService->getCheckExecutions($datastoreId, $inputUpload['_id']);

            foreach ($uploadChecks as &$checkType) {
                foreach ($checkType as &$checkExecution) {
                    $checkExecution = array_merge($checkExecution, $this->uploadApiService->getCheckExecution($datastoreId, $checkExecution['_id']));
                    try {
                        $checkExecution['logs'] = $this->uploadApiService->getCheckExecutionLogs($datastoreId, $checkExecution['_id']);
                    } catch (ApiException $ex) {
                    }
                    $inputUpload['checks'][] = $checkExecution;
                }
            }

            return $this->json([
                'input_upload' => $inputUpload,
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }
}
