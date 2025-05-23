<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\CommunityLayerApiService;
use App\Services\EspaceCoApi\DatabaseApiService;
use App\Services\EspaceCoApi\LayerApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/community/{communityId}/layer',
    name: 'cartesgouvfr_api_espaceco_community_layer_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] community-layers', description: 'Couches cartographiques associées à une communauté')]
class CommunityLayerController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private CommunityLayerApiService $communityLayerApiService,
        private LayerApiService $layerApiService,
        private DatabaseApiService $databaseApiService,
    ) {
    }

    /**
     * @param array<string> $fields
     */
    #[Route('/get_all', name: 'get_all', methods: ['GET'])]
    public function getAll(
        int $communityId,
        #[MapQueryParameter] ?array $fields = [],
    ): JsonResponse {
        try {
            $layers = $this->communityLayerApiService->getLayers($communityId, $fields);

            return new JsonResponse($layers);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<string> $fields
     */
    #[Route('/get_feature_types', name: 'get_feature_types', methods: ['GET'])]
    public function getFeatureTypes(
        int $communityId,
        #[MapQueryParameter] ?array $fields = [],
    ): JsonResponse {
        try {
            $layers = $this->communityLayerApiService->getLayers($communityId, $fields);

            // On ne garde que les feature types
            $ftLayers = array_values(array_filter($layers, fn ($layer) => (!is_null($layer['database']) && !is_null($layer['table']))));
            foreach ($ftLayers as &$ftLayer) {
                $this->_complete($ftLayer);
            }

            // Trier par database
            $ftLayers = $this->_groupByDatabase($ftLayers);

            return new JsonResponse($ftLayers);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/update', name: 'update', methods: ['PATCH'])]
    public function update(
        int $communityId,
        Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            foreach ($data['layer_tools'] as $layerId => $tools) {
                $this->layerApiService->updateLayer($communityId, $layerId, $tools);
            }

            return $this->getAll($communityId, $data['fields']);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed> $ftLayer
     */
    private function _complete(array &$ftLayer): void
    {
        $db = $this->databaseApiService->getDatabase($ftLayer['database'], ['name', 'title']);
        $ftLayer['database_name'] = $db['name'];
        $ftLayer['database_title'] = $db['title'];

        $table = $this->databaseApiService->getTable($ftLayer['database'], $ftLayer['table'], ['name', 'title', 'geometry_name', 'columns']);
        $ftLayer['table_name'] = $table['name'];
        $ftLayer['table_title'] = $table['title'];

        // Recherche de la colonne géométrique
        // TODO SUITE http://sd-redmine.ign.fr/issues/20378
        $columns = array_values(array_filter($table['columns'], fn ($column) => $column['name'] === $table['geometry_name']));
        $ftLayer['geometry_type'] = $columns[0]['type'];
    }

    /**
     * @param array<mixed> $ftLayers
     */
    private function _groupByDatabase(array $ftLayers): array
    {
        $layers = [];
        foreach ($ftLayers as $ftLayer) {
            $dbName = $ftLayer['database_title'];
            if (!array_key_exists($dbName, $layers)) {
                $layers[$dbName] = [];
            }
            $layers[$dbName][] = $ftLayer;
        }

        return $layers;
    }
}
