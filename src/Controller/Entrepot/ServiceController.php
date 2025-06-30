<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\Sandbox;
use App\Constants\EntrepotApi\ZoomLevels;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\CommonDTO;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\SandboxService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route(
    '/api/datastores/{datastoreId}/offerings',
    name: 'cartesgouvfr_api_service_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[cartes.gouv.fr] services', description: 'Actions génériques sur les services')]
class ServiceController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private CartesServiceApiService $cartesServiceApiService,
        private CapabilitiesService $capabilitiesService,
        private CartesMetadataApiService $cartesMetadataApiService,
        protected SandboxService $sandboxService,
    ) {
    }

    #[Route('', name: 'get_offerings_list', methods: ['GET'])]
    public function getOfferings(string $datastoreId, #[MapQueryParameter] bool $detailed = false): JsonResponse
    {
        try {
            if (true === $detailed) {
                $offerings = $this->configurationApiService->getAllOfferingsDetailed($datastoreId);
            } else {
                $offerings = $this->configurationApiService->getAllOfferings($datastoreId);
            }

            return $this->json($offerings);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'get_service', methods: ['GET'], requirements: ['offeringId' => Requirement::UUID_V4])]
    public function getService(string $datastoreId, string $offeringId): JsonResponse
    {
        try {
            $offering = $this->cartesServiceApiService->getService($datastoreId, $offeringId);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}', name: 'unpublish_service', methods: ['DELETE'])]
    public function unpublishService(string $datastoreId, string $offeringId): Response
    {
        try {
            $datastore = $this->datastoreApiService->get($datastoreId);

            $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $configuration = $this->configurationApiService->get($datastoreId, $offering['configuration']['_id']);

            $this->cartesServiceApiService->unpublish($datastoreId, $offeringId);

            // Mise a jour du capabilities
            try {
                // Recherche du endpoint
                $endpoints = array_values(array_filter($datastore['endpoints'], function ($ep) use ($offering) {
                    return $ep['endpoint']['_id'] === $offering['endpoint']['_id'];
                }));
                if (1 == count($endpoints)) {
                    $this->capabilitiesService->createOrUpdate($datastoreId, $endpoints[0]['endpoint'], $offering['urls'][0]['url']);
                }
            } catch (\Exception $e) {
            }

            if (isset($configuration['tags'][CommonTags::DATASHEET_NAME])) {
                $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME];

                $this->cartesMetadataApiService->updateLayers($datastoreId, $datasheetName);
            }

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/layernames', name: 'get_existing_layer_names', methods: ['GET'])]
    public function getExistingLayerNames(string $datastoreId, #[MapQueryParameter] string $type): JsonResponse
    {
        try {
            $configurations = $this->configurationApiService->getAll($datastoreId, [
                'type' => $type,
            ]);
            $offerings = $this->configurationApiService->getAllOfferings($datastoreId, [
                'type' => $type,
            ]);

            $configLayerNames = array_map(fn ($config) => $config['layer_name'], $configurations);
            $offeringLayerNames = array_map(fn ($offering) => $offering['layer_name'], $offerings);

            $existingLayerNames = array_values(array_unique(array_merge([], $configLayerNames, $offeringLayerNames)));

            $existingLayerNames = array_map(fn ($layerName) => str_ireplace(Sandbox::LAYERNAME_PREFIX, '', $layerName), $existingLayerNames);

            return $this->json($existingLayerNames);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed> $pyramid
     */
    protected function getPyramidZoomLevels(array $pyramid): array
    {
        if (!isset($pyramid['type_infos']) || !isset($pyramid['type_infos']['levels'])) {
            return ['bottom_level' => strval(ZoomLevels::BOTTOM_LEVEL_DEFAULT), 'top_level' => strval(ZoomLevels::TOP_LEVEL_DEFAULT)];
        }

        $levels = $pyramid['type_infos']['levels'];
        usort($levels, function (string $a, string $b) {
            return intval($a) - intval($b);
        });

        return ['bottom_level' => end($levels), 'top_level' => reset($levels)];
    }

    /**
     * @param array<mixed>  $typeInfos
     * @param ?array<mixed> $oldConfiguration
     */
    protected function getConfigRequestBody(string $datastoreId, string $type, CommonDTO $dto, array $typeInfos, ?array $oldConfiguration = null): array
    {
        $body = [
            'name' => $dto->service_name,
            'type' => $type,
            'type_infos' => $typeInfos,
        ];

        // seulement pour la création d'une nouvelle publication
        if (null === $oldConfiguration) {
            $body['layer_name'] = $dto->technical_name;

            // rajoute le préfixe "sandbox." si c'est la communauté bac à sable
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $body['layer_name'] = Sandbox::LAYERNAME_PREFIX.$body['layer_name'];
            }
        }

        if (!empty($dto->attribution_text) && !empty($dto->attribution_url)) {
            $body['attribution'] = [
                'title' => $dto->attribution_text,
                'url' => $dto->attribution_url,
            ];
        }

        if (isset($oldConfiguration['metadata'])) {
            $body['metadata'] = $oldConfiguration['metadata'];
        }

        return $body;
    }
}
