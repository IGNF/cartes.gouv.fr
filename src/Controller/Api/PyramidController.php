<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\StoredDataTags;
use App\Constants\EntrepotApi\UploadTags;
use App\Dto\Pyramid\AddPyramidDTO;
use App\Dto\Pyramid\CompositionDTO;
use App\Dto\Pyramid\PublishPyramidDTO;
use App\Exception\CartesApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastore/{datastoreId}/pyramid',
    name: 'cartesgouvfr_api_pyramid_'
)]
class PyramidController extends AbstractController implements ApiControllerInterface
{
    public const TOP_LEVEL_DEFAULT = 5;
    public const BOTTOM_LEVEL_DEFAULT = 18;

    public function __construct(
        private EntrepotApiService $entrepotApiService,
        private ParameterBagInterface $parameterBag
    ) {
    }

    #[Route('/add', name: 'add', methods: ['POST'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function add(string $datastoreId, #[MapRequestPayload] AddPyramidDTO $dto): JsonResponse
    {
        try {
            // TODO
            // $samplePyramidId = $request->query->get('samplePyramidId', null);

            $vectordb = $this->entrepotApiService->storedData->get($datastoreId, $dto->vectorDbId);

            // TODO Suppression de l'upload ?

            // On met les valeurs de bottom_level et top_level sous forme de chaine
            $composition = [];
            foreach ($dto->composition as $compo) {
                $composition[] = [
                    'table' => $compo->table,
                    'attributes' => $compo->attributes,
                    'bottom_level' => strval($compo->bottom_level),
                    'top_level' => strval($compo->top_level),
                ];
            }

            $levels = $this->getLevels($dto->composition);

            $parameters = [
                'composition' => $composition,
                'bottom_level' => strval(end($levels)),
                'top_level' => strval($levels[0]),
                'tippecanoe_options' => $dto->tippecanoe,
            ];

            if (!is_null($dto->area)) {
                $parameters['area'] = $dto->area;
            }

            $apiEntrepotProcessings = $this->parameterBag->get('api_entrepot')['processings'];

            $requestBody = [
                'processing' => $apiEntrepotProcessings['create_vect_pyr'],
                'inputs' => ['stored_data' => [$dto->vectorDbId]],
                'output' => ['stored_data' => [
                    'name' => $dto->technicalName,
                    'storage_tags' => ['PYRAMIDE'],
                ]],
                'parameters' => $parameters,
            ];

            // Ajout d'une execution de traitement
            $processingExecution = $this->entrepotApiService->processing->addExecution($datastoreId, $requestBody);
            $pyramidId = $processingExecution['output']['stored_data']['_id'];

            $this->entrepotApiService->storedData->addTags($datastoreId, $dto->vectorDbId, [
                'pyramid_id' => $pyramidId,
            ]);

            $pyramidTags = [
                UploadTags::DATASHEET_NAME => $vectordb['tags'][UploadTags::DATASHEET_NAME],
                'upload_id' => $vectordb['tags']['upload_id'],
                'proc_int_id' => $vectordb['tags']['proc_int_id'],
                'vectordb_id' => $dto->vectorDbId,
                'proc_pyr_creat_id' => $processingExecution['_id'],
                'is_sample' => is_null($dto->area) ? 'false' : 'true',
            ];

            $this->entrepotApiService->storedData->addTags($datastoreId, $pyramidId, $pyramidTags);
            $this->entrepotApiService->processing->launchExecution($datastoreId, $processingExecution['_id']);

            return new JsonResponse();
        } catch (CartesApiException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], $ex->getCode());
        }
    }

    #[
        Route('/publish/{pyramidId}', name: 'publish', methods: ['POST'],
            options: ['expose' => true],
            condition: 'request.isXmlHttpRequest()')
    ]
    public function publish(
        string $datastoreId,
        string $pyramidId,
        #[MapRequestPayload] PublishPyramidDTO $dto): JsonResponse
    {
        try {
            $pyramid = $this->entrepotApiService->storedData->get($datastoreId, $pyramidId);

            // Recherche de bottom_level et top_level
            $levels = $this->getBottomAndToLevel($pyramid);

            // TODO Suppression de l'Upload ?
            // TODO Suppression de la base de donnees

            // Restriction d'acces
            $endpoints = [];
            $isOfferingOpen = true;

            if ('all_public' === $dto->share_with) {
                $endpoints = $this->entrepotApiService->datastore->getEndpoints($datastoreId, [
                    'type' => 'WMTS-TMS',
                    'open' => true,
                ]);
                $isOfferingOpen = true;
            } elseif ('your_community' === $dto->share_with) {
                $endpoints = $this->entrepotApiService->datastore->getEndpoints($datastoreId, [
                    'type' => 'WMTS-TMS',
                    'open' => false,
                ]);
                $isOfferingOpen = false;
            }

            if (0 === count($endpoints)) {
                throw new CartesApiException("Aucun point d'accès (endpoint) du datastore ne peut convenir à la demande", Response::HTTP_BAD_REQUEST, ['share_with' => $dto->share_with]);
            }

            $endpointId = $endpoints[0]['endpoint']['_id'];

            // Ajout d'une execution de traitement
            $requestBody = [
                'type' => 'WMTS-TMS',
                'name' => $dto->public_name,
                'layer_name' => $dto->technical_name,
                'type_infos' => [
                    'title' => $dto->public_name,
                    'abstract' => $dto->description,
                    'keywords' => $dto->category,
                    'used_data' => [[
                        'bottom_level' => $levels['bottom_level'],
                        'top_level' => $levels['top_level'],
                        'stored_data' => $pyramidId,
                    ]],
                ],
            ];

            // Ajout de la configuration
            $configuration = $this->entrepotApiService->configuration->add($datastoreId, $requestBody);
            $configuration = $this->entrepotApiService->configuration->addTags($datastoreId, $configuration['_id'], [
                StoredDataTags::DATASHEET_NAME => $pyramid['tags'][StoredDataTags::DATASHEET_NAME],
            ]);

            // Creation d'une offering
            $offering = $this->entrepotApiService->configuration->addOffering($datastoreId, $configuration['_id'], $endpointId, $isOfferingOpen);

            return $this->json([
                'configuration' => $configuration,
                'offering' => $offering,
            ]);
        } catch (CartesApiException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], $ex->getCode());
        }
    }

    /**
     * @param array<CompositionDTO> $composition
     */
    private function getLevels($composition): array
    {
        $levels = [];
        foreach ($composition as $tableComposition) {
            $levels[] = $tableComposition->bottom_level;
            $levels[] = $tableComposition->top_level;
        }
        $levels = array_unique($levels, SORT_NUMERIC);
        sort($levels, SORT_NUMERIC);

        return $levels;
    }

    /**
     * @param array<mixed> $pyramid
     *
     * @return array
     */
    private function getBottomAndToLevel(array $pyramid)
    {
        if (!isset($pyramid['type_infos']) || !isset($pyramid['type_infos']['levels'])) {
            return ['bottom_level' => strval(self::BOTTOM_LEVEL_DEFAULT), 'top_level' => strval(self::TOP_LEVEL_DEFAULT)];
        }

        $levels = $pyramid['type_infos']['levels'];
        usort($levels, function (string $a, string $b) {
            return intval($a) - intval($b);
        });

        return ['bottom_level' => end($levels), 'top_level' => reset($levels)];
    }
}
