<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\UploadTags;
use App\Constants\EntrepotApi\UploadTypes;
use App\Controller\ApiControllerInterface;
use App\Controller\Traits\PaginatedHeadersTrait;
use App\Dto\Upload\UploadAddDTO;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\UploadApiService;
use App\Workflow\UploadIntegrationWorkflow;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
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
    use PaginatedHeadersTrait;

    public function __construct(
        private UploadApiService $uploadApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getList(
        string $datastoreId,
        Request $request,
        #[MapQueryParameter] ?bool $detailed = false,
        #[MapQueryParameter] ?bool $all = false,
    ): JsonResponse {
        try {
            $query = $request->query->all();
            unset($query['detailed']);
            unset($query['all']);

            if ($all) {
                return $this->json(
                    $detailed
                    ? $this->uploadApiService->getAllDetailed($datastoreId, $query)
                    : $this->uploadApiService->getAll($datastoreId, $query)->resolve()
                );
            }

            $apiResponse = $detailed
                ? $this->uploadApiService->getListDetailed($datastoreId, $query)
                : $this->uploadApiService->getList($datastoreId, $query);

            $response = new JsonResponse($apiResponse->content, Response::HTTP_OK);
            $this->setPaginatedHeaders($response, $apiResponse->headers);

            return $response;
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(
        string $datastoreId,
        #[MapRequestPayload] UploadAddDTO $dto,
    ): JsonResponse {
        try {
            // déclaration de livraison
            $pendingUpload = $this->uploadApiService->add($datastoreId, [
                'name' => $dto->name,
                'description' => $dto->description,
                'type' => UploadTypes::VECTOR,
                'srs' => $dto->srid,
            ]);

            // ajout tags sur la livraison
            $tags = [
                UploadTags::DATA_UPLOAD_PATH => $dto->data_upload_path,
                CommonTags::DATASHEET_NAME => $dto->datasheet_name,
                CommonTags::PRODUCER => $dto->producer,
                CommonTags::PRODUCTION_YEAR => $dto->getProductionYear(),
                CommonTags::PRODUCTION_DATE => $dto->production_date,
                CommonTags::THEME_CATEGORIES => implode(', ', $dto->themes),
                CommonTags::ZONE => trim($dto->zone),
                CommonTags::EMAIL_NOTIFICATION => $dto->email_notification,
            ];

            // tag optionnel
            if (null !== $dto->producer_short && '' !== trim($dto->producer_short)) {
                $tags[CommonTags::PRODUCER_SHORT] = trim($dto->producer_short);
            }

            $upload = $pendingUpload->array();
            $upload = $this->uploadApiService->addTags($datastoreId, $upload['_id'], $tags)->array();

            // retourne l'upload au frontend, qui se chargera de lancer l'intégration VECTOR-DB
            return $this->json($upload);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{uploadId}', name: 'get', methods: ['GET'])]
    public function get(string $datastoreId, string $uploadId): JsonResponse
    {
        try {
            return $this->json($this->uploadApiService->get($datastoreId, $uploadId)->array());
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
            return $this->json($ex->getDetails(), $ex->getStatusCode());
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
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
            $upload = $this->uploadApiService->get($datastoreId, $uploadId)->array();
            $progress = $uploadIntegrationWorkflow->computeProgress($datastoreId, $upload);

            // relecture seulement si une étape a été déclenchée
            if (false === $getOnlyProgress && $uploadIntegrationWorkflow->advanceIfPossible($datastoreId, $upload, $progress)) {
                $upload = $this->uploadApiService->get($datastoreId, $uploadId)->array();
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
                $this->uploadApiService->addTags($datastoreId, $uploadId, $uploadTags)->await();
            }

            // supprime livraison si intégration terminée
            if (false === $getOnlyProgress && $uploadIntegrationWorkflow->isIntegrationCompleted($progress)) {
                $this->uploadApiService->remove($datastoreId, $uploadId, $upload)->await();
            }

            // retourne l'upload complet + tags de progression pour que le frontend ait les données
            // même après suppression de l'upload (pour avoir accès à datasheet_name, vectordb_id, etc.)
            return $this->json([
                'upload' => $upload,
                UploadTags::INTEGRATION_PROGRESS => $progressJson,
                UploadTags::INTEGRATION_CURRENT_STEP => $stepString,
            ]);
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
            $this->uploadApiService->remove($datastoreId, $uploadId)->await();

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
            $inputUpload = $this->uploadApiService->get($datastoreId, $uploadId)->array();
            $inputUpload['file_tree'] = $this->uploadApiService->getFileTree($datastoreId, $inputUpload['_id'], $inputUpload);
            $inputUpload['checks'] = [];
            $uploadChecks = $this->uploadApiService->getCheckExecutions($datastoreId, $inputUpload['_id'])->array();

            foreach ($uploadChecks as &$checkType) {
                foreach ($checkType as &$checkExecution) {
                    $checkExecution = array_merge($checkExecution, $this->uploadApiService->getCheckExecution($datastoreId, $checkExecution['_id'])->array());
                    try {
                        $checkExecution['logs'] = $this->uploadApiService->getCheckExecutionLogs($datastoreId, $checkExecution['_id'])->array();
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
