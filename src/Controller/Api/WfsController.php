<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\CommonTags;
use App\Dto\WfsAddDTO;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/{storedDataId}/wfs',
    name: 'cartesgouvfr_api_wfs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class WfsController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService,
    ) {
    }

    #[Route('/', name: 'add')]
    public function add(
        string $datastoreId,
        string $storedDataId,
        #[MapRequestPayload] WfsAddDTO $dto): JsonResponse
    {
        try {
            $relations = [];
            foreach ($dto->table_infos as $table) {
                $relation = [
                    'native_name' => $table->native_name,
                    'title' => $table->title,
                    'abstract' => $table->description,
                ];
                if ($table->public_name) {
                    $relation['public_name'] = $table->public_name;
                }

                if ($table->keywords && 0 !== count($table->keywords)) {
                    $relation['keywords'] = $table->keywords;
                }
                $relations[] = $relation;
            }

            $body = [
                'type' => 'WFS',
                'name' => $dto->public_name,
                'layer_name' => $dto->technical_name,
                'type_infos' => [
                    'used_data' => [[
                        'relations' => $relations,
                        'stored_data' => $storedDataId,
                    ]],
                ],
            ];

            $storedData = $this->entrepotApiService->storedData->get($datastoreId, $storedDataId);
            $endpoints = [];
            $isOfferingOpen = true;

            // TODO : implémentation partielle, tous les partages ne sont pas couverts
            if ('all_public' === $dto->share_with) {
                $endpoints = $this->entrepotApiService->datastore->getEndpoints($datastoreId, [
                    'type' => 'WFS',
                    'open' => true,
                ]);
                $isOfferingOpen = true;
            } elseif ('your_community' === $dto->share_with) {
                $endpoints = $this->entrepotApiService->datastore->getEndpoints($datastoreId, [
                    'type' => 'WFS',
                    'open' => false,
                ]);
                $isOfferingOpen = false;
            } else {
                throw new CartesApiException('Valeur du champ [share_with] est invalide', Response::HTTP_BAD_REQUEST, ['share_with' => $dto->share_with]);
            }

            if (0 === count($endpoints)) {
                throw new CartesApiException("Aucun point d'accès (endpoint) du datastore ne peut convenir à la demande", Response::HTTP_BAD_REQUEST, ['share_with' => $dto->share_with]);
            }

            $endpointId = $endpoints[0]['endpoint']['_id'];

            // Ajout de la configuration
            $configuration = $this->entrepotApiService->configuration->add($datastoreId, $body);
            $configuration = $this->entrepotApiService->configuration->addTags($datastoreId, $configuration['_id'], [
                CommonTags::DATASHEET_NAME => $storedData['tags'][CommonTags::DATASHEET_NAME],
            ]);

            // Creation d'une offering
            $offering = $this->entrepotApiService->configuration->addOffering($datastoreId, $configuration['_id'], $endpointId, $isOfferingOpen);

            return $this->json([
                'configuration' => $configuration,
                'offering' => $offering,
            ]);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
