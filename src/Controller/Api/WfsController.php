<?php

namespace App\Controller\Api;

use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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

            // Ajout de la configuration
            $response = $this->entrepotApiService->configuration->add($datastoreId, $body);

            // Creation d'une offering
            $endpoint = $this->parameters->get('api_entrepot')['endpoints']['wfs_public'];
            $this->entrepotApiService->configuration->addOffering($datastoreId, $response['_id'], $endpoint);

            return new JsonResponse();
        } catch (EntrepotApiException $e) {
            return new JsonResponse();
        }
    }
}
