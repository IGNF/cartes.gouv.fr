<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Controller\ApiControllerInterface;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route(
    '/api/datastores/{datastoreId}/offerings',
    name: 'cartesgouvfr_api_service_',
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] services', description: 'Actions génériques sur les services')]
final class ServiceController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly DatastoreApiService $datastoreApiService,
        private readonly ConfigurationApiService $configurationApiService,
        private readonly CartesServiceApiService $cartesServiceApiService,
        private readonly CapabilitiesService $capabilitiesService,
        private readonly CartesMetadataApiService $cartesMetadataApiService,
    ) {
    }

    #[Route('', name: 'get_offerings_list', methods: ['GET'])]
    public function getOfferings(string $datastoreId, #[MapQueryParameter] bool $detailed = false, #[MapQueryParameter] bool $detailedConfiguration = false): JsonResponse
    {
        if ($detailed) {
            $offerings = $this->configurationApiService->getAllOfferingsDetailed($datastoreId)->resolve();
        } else {
            $offerings = $this->configurationApiService->getAllOfferings($datastoreId)->resolve();
        }

        if ($detailedConfiguration) {
            $pendingConfigurationsById = [];

            foreach ($offerings as $offering) {
                $configId = $offering['configuration']['_id'];
                $pendingConfigurationsById[$configId] = $this->configurationApiService->get($datastoreId, $configId);
            }

            $configurationsById = $this->configurationApiService->api->resolveAll($pendingConfigurationsById);

            foreach ($offerings as &$offering) {
                $configId = $offering['configuration']['_id'];
                $offering['configuration'] = $configurationsById[$configId];
            }
            unset($offering);
        }

        return $this->json($offerings);
    }

    #[Route('/{offeringId}', name: 'get_service', methods: ['GET'], requirements: ['offeringId' => Requirement::UUID_V4])]
    public function getService(string $datastoreId, string $offeringId): JsonResponse
    {
        $offering = $this->cartesServiceApiService->getService($datastoreId, $offeringId);

        return $this->json($offering);
    }

    #[Route('/{offeringId}/stats', name: 'get_service_stats', methods: ['GET'], requirements: ['offeringId' => Requirement::UUID_V4])]
    public function getServiceStats(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        $query = $request->query->all();
        $stats = $this->configurationApiService->getOfferingStats($datastoreId, $offeringId, $query)->resolve();

        return $this->json($stats);
    }

    #[Route('/{offeringId}', name: 'unpublish_service', methods: ['DELETE'])]
    public function unpublishService(string $datastoreId, string $offeringId): Response
    {
        $datastore = $this->datastoreApiService->get($datastoreId);

        $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();
        $configuration = $this->cartesServiceApiService->unpublish($datastoreId, $offeringId, $offering);

        // Mise a jour du capabilities
        try {
            // Recherche du endpoint
            $endpoints = array_values(array_filter($datastore['endpoints'], function ($ep) use ($offering) {
                return $ep['endpoint']['_id'] === $offering['endpoint']['_id'];
            }));
            if (1 === count($endpoints)) {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoints[0]['endpoint'], $offering['urls'][0]['url']);
            }
        } catch (\Exception) {
        }

        if (isset($configuration['tags'][CommonTags::DATASHEET_NAME])) {
            $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME];

            $services = $this->cartesServiceApiService->getDatasheetServices($datastoreId, $datasheetName);
            $this->cartesMetadataApiService->refreshOnlineResources($datastoreId, $datasheetName, $services);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/layernames', name: 'get_existing_layer_names', methods: ['GET'])]
    public function getExistingLayerNames(string $datastoreId, #[MapQueryParameter] string $type): JsonResponse
    {
        $configurations = $this->configurationApiService->getAll($datastoreId, [
            'type' => $type,
        ])->resolve();
        $offerings = $this->configurationApiService->getAllOfferings($datastoreId, [
            'type' => $type,
        ])->resolve();

        $configLayerNames = array_map(fn ($config) => $config['layer_name'], $configurations);
        $offeringLayerNames = array_map(fn ($offering) => $offering['layer_name'], $offerings);

        $existingLayerNames = array_values(array_unique(array_merge([], $configLayerNames, $offeringLayerNames)));

        return $this->json($existingLayerNames);
    }
}
