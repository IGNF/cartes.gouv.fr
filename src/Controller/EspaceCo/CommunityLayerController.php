<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\CommunityLayerApiService;
use App\Services\EspaceCoApi\DatabaseApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/community/{communityId}/layer',
    name: 'cartesgouvfr_api_espaceco_community_layer_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class CommunityLayerController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private CommunityLayerApiService $communityLayerApiService,
        private DatabaseApiService $databaseApiService,
    ) {
    }

    /**
     * @param array<string> $fields
     */
    #[Route('/get_feature_types', name: 'get_feature_types', methods: ['GET'])]
    public function getAll(
        int $communityId,
        #[MapQueryParameter] ?array $fields = [],
    ): JsonResponse {
        try {
            $layers = $this->communityLayerApiService->getLayers($communityId, $fields);

            // On ne garde que les feature types
            $featureTypes = array_values(array_filter($layers, fn ($layer) => (!is_null($layer['database']) && !is_null($layer['table']))));
            foreach ($featureTypes as &$featureType) {
                $this->_complete($featureType);
            }

            return new JsonResponse($featureTypes);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed> $featureType
     */
    private function _complete(array &$featureType): void
    {
        $db = $this->databaseApiService->getDatabase($featureType['database'], ['name', 'title']);
        $featureType['database_name'] = $db['name'];
        $featureType['database_title'] = $db['title'];

        $table = $this->databaseApiService->getTable($featureType['database'], $featureType['table'], ['database', 'name', 'title', 'geometry_name', 'columns']);
        $featureType['table_name'] = $table['name'];
        $featureType['table_title'] = $table['title'];

        // Recherche de la colonne géométrique
        // TODO SUITE http://sd-redmine.ign.fr/issues/20378
        $columns = array_values(array_filter($table['columns'], fn ($column) => $column['name'] === $table['geometry_name']));
        $featureType['geometry_type'] = $columns[0]['type'];
    }
}
