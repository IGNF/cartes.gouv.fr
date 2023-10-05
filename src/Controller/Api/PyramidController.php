<?php

namespace App\Controller\Api;

use App\Dto\Pyramid\AddPyramidDTO;
use App\Dto\Pyramid\CompositionDTO;
use App\Services\EntrepotApiService;
use App\Exception\CartesApiException;
use App\Constants\EntrepotApi\UploadTags;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[Route(
    '/api/datastore/{datastoreId}/pyramid',
    name: 'cartesgouvfr_api_pyramid_'
)]
class PyramidController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService,
        private ParameterBagInterface $parameterBag
    ) {
    }

    #[
        Route('/add', name: 'add', methods: ['POST'], 
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
            foreach($dto->composition as $compo) {
                $composition[] = [
                    'table' => $compo->table,
                    'attributes' => $compo->attributes,
                    'bottom_level' => strval($compo->bottom_level),
                    'top_level' => strval($compo->top_level)
                ];
            }

            $levels = $this->getLevels($dto->composition);

            $parameters = [
                'composition' => $composition,
                'bottom_level' => strval(end($levels)),
                'top_level' => strval($levels[0]),
                'tippecanoe_options' => $dto->tippecanoe  
            ];

            if (! is_null($dto->area)) {
                $parameters['area'] = $dto->area;   
            }

            $apiEntrepotProcessings = $this->parameterBag->get('api_entrepot')['processings'];

            $requestBody = [
                'processing' => $apiEntrepotProcessings['create_vect_pyr'],
                'inputs' => ['stored_data' => [$dto->vectorDbId]],
                'output' => ['stored_data' => [
                    'name' => $dto->technicalName,
                    'storage_tags' => ['PYRAMIDE']
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
                'is_sample' => is_null($dto->area) ? "false" : "true"
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
    public function publish(string $datastoreId, string $pyramidId): JsonResponse
    {
        // TODO Suppression de l'Upload ?

        // TODO Suppression de la base de donnees

        
        return new JsonResponse();
    }

    /**
     * @param array<CompositionDTO> $composition
     * @return array
     */
    private function getLevels($composition) : array {
        $levels = [];
        foreach($composition as $tableComposition) {
            $levels[] = $tableComposition->bottom_level;
            $levels[] = $tableComposition->top_level;
        }
        $levels = array_unique($levels, SORT_NUMERIC);
        sort($levels, SORT_NUMERIC);
        return $levels;
    }
}
