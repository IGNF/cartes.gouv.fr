<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ProcessingStatuses;
use App\Constants\EntrepotApi\StoredDataStatuses;
use App\Constants\EntrepotApi\UploadCheckTypes;
use App\Constants\EntrepotApi\UploadStatuses;
use App\Constants\EntrepotApi\UploadTags;
use App\Constants\EntrepotApi\UploadTypes;
use App\Constants\JobStatuses;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\EntrepotApi\UploadApiService;
use App\Services\SandboxService;
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
    // condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[entrepot] upload')]
class UploadController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private UploadApiService $uploadApiService,
        private SandboxService $datastoreService,
        private ProcessingApiService $processingApiService,
        private StoredDataApiService $storedDataApiService,
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
        #[MapQueryParameter] bool $getOnlyProgress = false,
    ): JsonResponse {
        $upload = $this->uploadApiService->get($datastoreId, $uploadId);

        // construction de progress initial
        $initialIntegProgress = [
            UploadTags::INT_STEP_SEND_FILES_API => JobStatuses::WAITING,
            UploadTags::INT_STEP_WAIT_CHECKS => JobStatuses::WAITING,
            UploadTags::INT_STEP_PROCESSING => JobStatuses::WAITING,
        ];

        if (!isset($upload['tags'][UploadTags::INTEGRATION_CURRENT_STEP]) && !isset($upload['tags'][UploadTags::INTEGRATION_PROGRESS])) {
            $guessedProgress = $this->guessIntegrationProgressTags($datastoreId, $upload);
            $integCurrentStep = $guessedProgress[UploadTags::INTEGRATION_CURRENT_STEP];
            $integProgress = json_decode($guessedProgress[UploadTags::INTEGRATION_PROGRESS], true);
        } else {
            // lecture de progress si existe déjà dans les tags de l'upload, sinon on part du progress initial
            $integCurrentStep = isset($upload['tags'][UploadTags::INTEGRATION_CURRENT_STEP]) ? intval($upload['tags'][UploadTags::INTEGRATION_CURRENT_STEP]) : 0;
            $integProgress = isset($upload['tags'][UploadTags::INTEGRATION_PROGRESS]) ? json_decode($upload['tags'][UploadTags::INTEGRATION_PROGRESS], true) : $initialIntegProgress;
        }

        // clone de progress
        $integCurrStepClone = $integCurrentStep;
        $integProgressClone = $integProgress;

        try {
            // on exécute les étapes de l'intégration si getOnlyProgress est à false
            if (false === $getOnlyProgress && $integCurrentStep < count($integProgress)) {
                [$integCurrentStep, $integProgress] = $this->runIntegrationStep($datastoreId, $upload, $integProgress, $integCurrentStep);
            }

            $uploadTags = [
                UploadTags::INTEGRATION_CURRENT_STEP => $integCurrentStep,
                UploadTags::INTEGRATION_PROGRESS => json_encode($integProgress),
            ];

            // mise à jour état des étapes de l'intégration uniquement si changement
            if ($integCurrStepClone !== $integCurrentStep || $integProgressClone !== $integProgress) {
                $upload = $this->uploadApiService->addTags($datastoreId, $uploadId, $uploadTags);
            }

            return $this->json($uploadTags);
        } catch (ApiException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        }
    }

    /**
     * Essayer de deviner la progression de l'intégration d'un upload si le fichier n'a pas été déposé via cartes.gouv.fr (le plugin qgis par exemple).
     * // TODO : je sais pas encore si cette méthode est infaillible. Si on est sûr que ça couvre tous les cas, on peut essayer de supprimer les tags.
     *
     * @param array<mixed> $upload
     *
     * @return array<string,mixed>
     */
    private function guessIntegrationProgressTags(string $datastoreId, array $upload): array
    {
        $initialIntegProgress = [
            UploadTags::INT_STEP_SEND_FILES_API => JobStatuses::WAITING,
            UploadTags::INT_STEP_WAIT_CHECKS => JobStatuses::WAITING,
            UploadTags::INT_STEP_PROCESSING => JobStatuses::WAITING,
        ];
        $guessedProgress = $initialIntegProgress;
        $guessedProgressionStep = 0;

        // A la création de l'upload, le status est à "OPEN"
        // Si le statut est "CLOSED" ou "CHECKING", on considère que l'étape d'envoi des fichiers a été réalisée
        if (in_array($upload['status'], [UploadStatuses::CLOSED, UploadStatuses::CHECKING])) {
            $guessedProgress[UploadTags::INT_STEP_SEND_FILES_API] = JobStatuses::SUCCESSFUL;
            $guessedProgressionStep = 1;
        }

        if (JobStatuses::SUCCESSFUL === $guessedProgress[UploadTags::INT_STEP_SEND_FILES_API]) {
            $uploadChecks = $this->uploadApiService->getCheckExecutions($datastoreId, $upload['_id']);

            if (0 === count($uploadChecks[UploadCheckTypes::ASKED]) && 0 === count($uploadChecks[UploadCheckTypes::IN_PROGRESS])) {
                // il ne reste plus de check dans les catégories "asked" ou "in_progress"
                if (0 === count($uploadChecks[UploadCheckTypes::FAILED])) {
                    // aucune check a échoué
                    $guessedProgress[UploadTags::INT_STEP_WAIT_CHECKS] = JobStatuses::SUCCESSFUL;
                    $guessedProgressionStep = 2;
                } else {
                    $guessedProgress[UploadTags::INT_STEP_WAIT_CHECKS] = JobStatuses::FAILED;
                }
            } elseif (count($uploadChecks[UploadCheckTypes::ASKED]) > 0 || count($uploadChecks[UploadCheckTypes::IN_PROGRESS]) > 0) {
                $guessedProgress[UploadTags::INT_STEP_WAIT_CHECKS] = JobStatuses::IN_PROGRESS;
            }
        }

        if (JobStatuses::SUCCESSFUL === $guessedProgress[UploadTags::INT_STEP_WAIT_CHECKS]) {
            if (isset($upload['tags']['proc_int_id']) && isset($upload['tags']['vectordb_id'])) {
                $processingExec = $this->processingApiService->getExecution($datastoreId, $upload['tags']['proc_int_id']);
                $vectordb = $this->storedDataApiService->get($datastoreId, $upload['tags']['vectordb_id']);

                if (!in_array($processingExec['status'], [ProcessingStatuses::CREATED, ProcessingStatuses::WAITING, ProcessingStatuses::PROGRESS])) {
                    if (ProcessingStatuses::SUCCESS == $processingExec['status'] && StoredDataStatuses::GENERATED == $vectordb['status']) {
                        $guessedProgress[UploadTags::INT_STEP_PROCESSING] = JobStatuses::SUCCESSFUL;
                        $guessedProgressionStep = 3;
                    } else {
                        $guessedProgress[UploadTags::INT_STEP_PROCESSING] = JobStatuses::FAILED;
                    }
                }
            }
        }

        return [
            UploadTags::INTEGRATION_PROGRESS => json_encode($guessedProgress),
            UploadTags::INTEGRATION_CURRENT_STEP => $guessedProgressionStep,
        ];
    }

    /**
     * @param array<mixed> $upload
     * @param array<mixed> $progress
     */
    private function runIntegrationStep(string $datastoreId, array $upload, array $progress, int $currentStep): array
    {
        $currentStepName = array_keys($progress)[$currentStep];
        $currentStepStatus = isset($progress[$currentStepName]) ? $progress[$currentStepName] : JobStatuses::WAITING;

        try {
            switch ($currentStepName) {
                case UploadTags::INT_STEP_SEND_FILES_API:
                    switch ($currentStepStatus) {
                        case JobStatuses::WAITING:
                            // si l'étape est prête et en attente à être exécutée, on lance l'étape
                            if (UploadStatuses::CLOSED === $upload['status']) {
                                $this->uploadApiService->open($datastoreId, $upload['_id']);
                            }

                            $this->uploadApiService->addFile($datastoreId, $upload['_id'], $upload['tags'][UploadTags::DATA_UPLOAD_PATH]);

                            $currentStepStatus = JobStatuses::IN_PROGRESS;
                            break;
                        case JobStatuses::IN_PROGRESS:
                            // vérifier ici si l'étape a terminé && réussi ou échoué ?
                            if (in_array($upload['status'], [UploadStatuses::CLOSED, UploadStatuses::CHECKING])) {
                                $currentStepStatus = JobStatuses::SUCCESSFUL;
                            }
                            break;
                        case JobStatuses::SUCCESSFUL:
                            // action si l'étape a terminé en succès
                            $currentStep++;
                            break;
                    }

                    break;
                case UploadTags::INT_STEP_WAIT_CHECKS:
                    switch ($currentStepStatus) {
                        case JobStatuses::WAITING:
                            // ne rien faire
                            if (UploadStatuses::CHECKING === $upload['status']) {
                                $currentStepStatus = JobStatuses::IN_PROGRESS;
                            }
                            break;
                        case JobStatuses::IN_PROGRESS:
                            $uploadChecks = $this->uploadApiService->getCheckExecutions($datastoreId, $upload['_id']);

                            if (0 == count($uploadChecks[UploadCheckTypes::ASKED]) && 0 == count($uploadChecks[UploadCheckTypes::IN_PROGRESS])) {
                                // il ne reste plus de check dans les catégories "asked" ou "in_progress"
                                if (0 == count($uploadChecks[UploadCheckTypes::FAILED])) {
                                    // aucune check a échoué
                                    $currentStepStatus = JobStatuses::SUCCESSFUL;
                                } else {
                                    $currentStepStatus = JobStatuses::FAILED;
                                }
                            }
                            break;
                        case JobStatuses::SUCCESSFUL:
                            // action si l'étape a terminé en succès
                            $currentStep++;
                            break;
                    }

                    break;
                case UploadTags::INT_STEP_PROCESSING:
                    switch ($currentStepStatus) {
                        case JobStatuses::WAITING:
                            $processing = $this->datastoreService->getProcIntegrateVectorFilesInBase($datastoreId);

                            $procExecBody = [
                                'processing' => $processing,
                                'inputs' => [
                                    'upload' => [$upload['_id']],
                                ],
                                'output' => [
                                    'stored_data' => [
                                        'name' => $upload['name'],
                                        'storage_tags' => ['VECTEUR'], // TODO : choisir VECTEUR ou RASTER en fonction du type de upload
                                    ],
                                ],
                            ];

                            $processingExec = $this->processingApiService->addExecution($datastoreId, $procExecBody);
                            $vectorDb = $processingExec['output']['stored_data'];

                            // ajout tags sur l'upload
                            $this->uploadApiService->addTags($datastoreId, $upload['_id'], [
                                'vectordb_id' => $vectorDb['_id'],
                                'proc_int_id' => $processingExec['_id'],
                            ]);

                            // ajout tags sur la stored_data
                            $tags = [
                                'upload_id' => $upload['_id'],
                                'proc_int_id' => $processingExec['_id'],
                                CommonTags::DATASHEET_NAME => $upload['tags'][CommonTags::DATASHEET_NAME],
                            ];
                            if (isset($upload['tags'][CommonTags::PRODUCER])) {
                                $tags[CommonTags::PRODUCER] = $upload['tags'][CommonTags::PRODUCER];
                            }
                            if (isset($upload['tags'][CommonTags::PRODUCTION_YEAR])) {
                                $tags[CommonTags::PRODUCTION_YEAR] = $upload['tags'][CommonTags::PRODUCTION_YEAR];
                            }
                            $this->storedDataApiService->addTags($datastoreId, $vectorDb['_id'], $tags);

                            // // TODO : mise à jour ?

                            $this->processingApiService->launchExecution($datastoreId, $processingExec['_id']);
                            $currentStepStatus = JobStatuses::IN_PROGRESS;
                            break;

                        case JobStatuses::IN_PROGRESS:
                            $processingExec = $this->processingApiService->getExecution($datastoreId, $upload['tags']['proc_int_id']);
                            $vectordb = $this->storedDataApiService->get($datastoreId, $upload['tags']['vectordb_id']);

                            if (!in_array($processingExec['status'], [ProcessingStatuses::CREATED, ProcessingStatuses::WAITING, ProcessingStatuses::PROGRESS])) {
                                if (ProcessingStatuses::SUCCESS == $processingExec['status'] && StoredDataStatuses::GENERATED == $vectordb['status']) {
                                    $currentStepStatus = JobStatuses::SUCCESSFUL;
                                } else {
                                    $currentStepStatus = JobStatuses::FAILED;
                                }
                            }
                            break;
                        case JobStatuses::SUCCESSFUL:
                            $currentStep++;
                            break;
                    }
                    break;
            }
        } catch (\Throwable $th) {
            $currentStepStatus = JobStatuses::FAILED;
            throw $th;
        }

        $progress[$currentStepName] = $currentStepStatus;

        return [$currentStep, $progress];
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
