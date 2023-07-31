<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\StoredDataTags;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/{storedDataId}/wfs',
    name: 'cartesgouvfr_api_wfs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class WfsController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService,
        private ParameterBagInterface $parameters
    ) {
    }

    #[Route('/', name: 'add')]
    public function add(string $datastoreId, string $storedDataId, Request $request): JsonResponse
    {
        try {
            $content = json_decode($request->getContent(), true);

            $relations = [];
            $tables = json_decode($content['data_tables'], true);

            foreach ($tables as $tableName => $desc) {
                $relation = [
                    'native_name' => $tableName,
                    'title' => $desc['title'],
                    'abstract' => $desc['description'],
                ];
                foreach (['public_name', 'keywords'] as $key) {
                    if (isset($desc[$key])) {
                        $relation[$key] = $desc[$key];
                    }
                }
                $relations[] = $relation;
            }

            $body = [
                'type' => 'WFS',
                'name' => $content['data_public_name'],
                'layer_name' => $content['data_technical_name'],
                'type_infos' => [
                    'used_data' => [[
                        'relations' => $relations,
                        'stored_data' => $storedDataId,
                    ]],
                ],
            ];

            $storedData = $this->entrepotApiService->storedData->get($datastoreId, $storedDataId);
            // $endpoints = [];

            // TODO : désactivé temporairement, le champ share_with n'est pas récupéré dans la requête
            // TODO : implémentation partielle, tous les ne sont pas couverts
            // if ('all_public' === $content['share_with']) {
            //     $endpoints = $this->entrepotApiService->datastore->getEndpoints($datastoreId, [
            //         'type' => 'WFS',
            //         'open' => true,
            //     ]);
            // } elseif ('your_community' === $content['share_with']) {
            //     $endpoints = $this->entrepotApiService->datastore->getEndpoints($datastoreId, [
            //         'type' => 'WFS',
            //         'open' => false,
            //     ]);
            // } else {
            //     throw new CartesApiException('Valeur du champ [share_with] est invalide', Response::HTTP_BAD_REQUEST, ['share_with' => $content['share_with']]);
            // }

            // if (0 === count($endpoints)) {
            //     throw new CartesApiException("Aucun point d'accès (endpoint) du datastore ne peut convenir à la demande", Response::HTTP_BAD_REQUEST, ['share_with' => $content['share_with']]);
            // }

            // $endpointId = $endpoints[0]['_id'];
            $endpointId = $this->parameters->get('api_entrepot')['endpoints']['wfs_public'];

            // Ajout de la configuration
            $configuration = $this->entrepotApiService->configuration->add($datastoreId, $body);
            $configuration = $this->entrepotApiService->configuration->addTags($datastoreId, $configuration['_id'], [
                StoredDataTags::DATASHEET_NAME => $storedData['tags'][StoredDataTags::DATASHEET_NAME],
            ]);

            // Creation d'une offering
            $offering = $this->entrepotApiService->configuration->addOffering($datastoreId, $configuration['_id'], $endpointId);

            return $this->json([
                'configuration' => $configuration,
                'offering' => $offering,
            ]);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
