<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\ProcessingStatuses;
use App\Constants\EntrepotApi\StoredDataStatuses;
use App\Constants\EntrepotApi\UploadCheckTypes;
use App\Constants\EntrepotApi\UploadStatuses;
use App\Constants\EntrepotApi\UploadTags;
use App\Constants\EntrepotApi\UploadTypes;
use App\Constants\JobStatuses;
use App\Exception\AppException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastore/{datastoreId}/upload',
    name: 'cartesgouvfr_api_upload_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class UploadController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService,
        private ParameterBagInterface $parameterBag,
    ) {
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $content = json_decode($request->getContent(), true);

            // déclaration de livraison
            // TODO : nom de la fiche de donnée, qu'est-ce qu'on fait ?
            $uploadData = [
                'name' => $content['data_technical_name'],
                'description' => $content['data_technical_name'],
                'type' => UploadTypes::VECTOR,
                'srs' => $content['data_srid'],
            ];
            $upload = $this->entrepotApiService->upload->add($datastoreId, $uploadData);

            // ajout tags sur la livraison
            $tags = [
                UploadTags::DATA_UPLOAD_PATH => $content['data_upload_path'],
                // statut des checks et du processing intégration
            ];
            $upload = $this->entrepotApiService->upload->addTags($datastoreId, $upload['_id'], $tags);

            // retourne l'upload au frontend, qui se chargera de lancer l'intégration VECTOR-DB
            return $this->json($upload);
        } catch (AppException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], $ex->getCode());
        }
    }

    #[Route('/{uploadId}/integration_progress', name: 'integration_progress', methods: ['POST'])]
    public function integrationProgress(string $datastoreId, string $uploadId): JsonResponse
    {
        // lecture dernier état des étapes de l'intégration
        $upload = $this->entrepotApiService->upload->get($datastoreId, $uploadId);

        $defaultIntegProgress = [
            UploadTags::INT_STEP_SEND_FILES_API => JobStatuses::WAITING,
            UploadTags::INT_STEP_WAIT_CHECKS => JobStatuses::WAITING,
            UploadTags::INT_STEP_PROCESSING => JobStatuses::WAITING,
        ];
        $integCurrentStep = isset($upload['tags'][UploadTags::INTEGRATION_CURRENT_STEP]) ? intval($upload['tags'][UploadTags::INTEGRATION_CURRENT_STEP]) : 0;
        $integProgress = isset($upload['tags'][UploadTags::INTEGRATION_PROGRESS]) ? json_decode($upload['tags'][UploadTags::INTEGRATION_PROGRESS], true) : $defaultIntegProgress;

        $integCurrStepClone = $integCurrentStep;
        $integProgressClone = $integProgress;

        try {
            // faire des trucs ici
            [$integCurrentStep, $integProgress] = $this->runIntegrationStep($datastoreId, $upload, $integProgress, $integCurrentStep);

            $uploadTags = [
                UploadTags::INTEGRATION_CURRENT_STEP => $integCurrentStep,
                UploadTags::INTEGRATION_PROGRESS => json_encode($integProgress),
            ];

            // mise à jour état des étapes de l'intégration si changement
            if ($integCurrStepClone !== $integCurrentStep || $integProgressClone !== $integProgress) {
                $uploadTags['changed'] = true;
                $upload = $this->entrepotApiService->upload->addTags($datastoreId, $uploadId, $uploadTags);
            }

            return $this->json($uploadTags);
        } catch (EntrepotApiException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        }
    }

    /**
     * @param array<mixed> $upload
     * @param array<mixed> $progress
     */
    public function runIntegrationStep(string $datastoreId, array $upload, array $progress, int $currentStep): array
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
                                $this->entrepotApiService->upload->open($datastoreId, $upload['_id']);
                            }

                            $this->entrepotApiService->upload->addFile($datastoreId, $upload['_id'], $upload['tags'][UploadTags::DATA_UPLOAD_PATH]);

                            $currentStepStatus = JobStatuses::IN_PROGRESS;
                            break;
                        case JobStatuses::IN_PROGRESS:
                            // vérifier ici si l'étape a terminé && réussi ou échoué ?
                            if (UploadStatuses::CLOSED === $upload['status']) {
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
                            $currentStepStatus = JobStatuses::IN_PROGRESS;
                            break;
                        case JobStatuses::IN_PROGRESS:
                            $uploadChecks = $this->entrepotApiService->upload->getCheckExecutions($datastoreId, $upload['_id']);

                            if (0 == count($uploadChecks[UploadCheckTypes::ASKED]) && 0 == count($uploadChecks[UploadCheckTypes::IN_PROGRESS])) {
                                // il ne reste plus de check dans les catégories "asked" ou "in_progress"
                                if (0 == count($uploadChecks[UploadCheckTypes::FAILED])) {
                                    // aucune check a échoué
                                    $currentStepStatus = JobStatuses::SUCCESSFUL;
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
                            /** @var array<string> */
                            $apiPlageProcessings = $this->parameterBag->get('api_plage_processings');

                            $procExecBody = [
                                'processing' => $apiPlageProcessings['int_vect_files_db'],
                                'inputs' => [
                                    'upload' => [$upload['_id']],
                                ],
                                'output' => [
                                    'stored_data' => ['name' => $upload['name']],
                                ],
                            ];

                            $processingExec = $this->entrepotApiService->processing->addExecution($datastoreId, $procExecBody);
                            $vectorDb = $processingExec['output']['stored_data'];

                            // ajout tags sur l'upload
                            $this->entrepotApiService->upload->addTags($datastoreId, $upload['_id'], [
                                'vectordb_id' => $vectorDb['_id'],
                                'proc_int_id' => $processingExec['_id'],
                            ]);

                            // ajout tags sur la stored_data
                            $this->entrepotApiService->storedData->addTags($datastoreId, $vectorDb['_id'], [
                                'upload_id' => $upload['_id'],
                                'proc_int_id' => $processingExec['_id'],
                            ]);

                            // TODO : mise à jour ?

                            $this->entrepotApiService->processing->launchExecution($datastoreId, $processingExec['_id']);
                            $currentStepStatus = JobStatuses::IN_PROGRESS;
                            break;

                        case JobStatuses::IN_PROGRESS:
                            $processingExec = $this->entrepotApiService->processing->getExecution($datastoreId, $upload['tags']['proc_int_id']);
                            $vectordb = $this->entrepotApiService->storedData->get($datastoreId, $upload['tags']['vectordb_id']);

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
        }

        $progress[$currentStepName] = $currentStepStatus;

        return [$currentStep, $progress];
    }
}