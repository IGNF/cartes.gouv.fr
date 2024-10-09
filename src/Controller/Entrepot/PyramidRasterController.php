<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\SandboxService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/pyramid-raster',
    name: 'cartesgouvfr_api_pyramid_raster_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class PyramidRasterController extends ServiceController implements ApiControllerInterface
{
    public function __construct(
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private StoredDataApiService $storedDataApiService,
        private ProcessingApiService $processingApiService,
        SandboxService $sandboxService,
        CartesServiceApiService $cartesServiceApiService,
        CapabilitiesService $capabilitiesService,
        CartesMetadataApiService $cartesMetadataApiService,
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApiService, $capabilitiesService, $cartesMetadataApiService, $sandboxService);
    }

    /**
     * @param array<mixed> $bbox
     */
    private function bboxToWkt(array $bbox): string
    {
        $str = 'POLYGON((west north,east north,east south,west south,west north))';

        return preg_replace_callback('/[a-z]+/', function ($matches) use ($bbox) {
            $key = $matches[0];

            return $bbox[$key];
        }, $str);
    }

    #[Route('/add', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            $processingId = $this->sandboxService->getProcGeneratePyramidRaster($datastoreId);

            $wmsvOffering = $this->configurationApiService->getOffering($datastoreId, $data['wmsv_offering_id']);
            $wmsvConfiguration = $this->configurationApiService->get($datastoreId, $wmsvOffering['configuration']['_id']);

            $vectorDbId = $wmsvConfiguration['type_infos']['used_data'][0]['stored_data'] ?? null;
            if (null === $vectorDbId) {
                throw new AppException(sprintf('Donnée stockée du type %s référencée par le service WMS-Vecteur non trouvée', StoredDataTypes::VECTOR_DB), Response::HTTP_BAD_REQUEST);
            }

            $vectordb = $this->storedDataApiService->get($datastoreId, $vectorDbId);

            $serviceEndpoint = $this->datastoreApiService->getEndpoint($datastoreId, $wmsvOffering['endpoint']['_id']);
            $harvestUrl = $serviceEndpoint['endpoint']['urls'][0]['url'] ?? null;

            if (null === $harvestUrl) {
                throw new AppException('URL du service WMS-Vecteur non trouvée', Response::HTTP_BAD_REQUEST);
            }

            $requestBody = [
                'processing' => $processingId,
                'output' => [
                    'stored_data' => [
                        'name' => 'aaaaaaaaaaaa', // $data['technical_name'],
                    ],
                ],
                'parameters' => [
                    'samplesperpixel' => 3,
                    'sampleformat' => 'UINT8',
                    'tms' => 'PM',
                    'compression' => 'jpg',
                    'bottom' => '14',
                    'harvest_levels' => ['14', '10'],
                    'harvest_format' => 'image/jpeg',
                    'harvest_url' => $harvestUrl,
                    'harvest_layers' => $wmsvOffering['layer_name'],
                    'harvest_area' => $this->bboxToWkt($wmsvConfiguration['type_infos']['bbox']),
                    // 'POLYGON((1.999375 50.25875,5.8734375 50.25875,5.8734375 47.940898437,1.999375 47.940898437,1.999375 50.25875))',
                ],
            ];

            $processingExecution = $this->processingApiService->addExecution($datastoreId, $requestBody);
            $pyramidId = $processingExecution['output']['stored_data']['_id'];

            $pyramidTags = [
                CommonTags::DATASHEET_NAME => $vectordb['tags'][CommonTags::DATASHEET_NAME],
                'upload_id' => $vectordb['tags']['upload_id'],
                'proc_int_id' => $vectordb['tags']['proc_int_id'],
                'vectordb_id' => $vectorDbId,
                'proc_pyr_creat_id' => $processingExecution['_id'],
            ];

            $this->storedDataApiService->addTags($datastoreId, $pyramidId, $pyramidTags);
            $this->processingApiService->launchExecution($datastoreId, $processingExecution['_id']);

            return new JsonResponse();
        } catch (ApiException|AppException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
