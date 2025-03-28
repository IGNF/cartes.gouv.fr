<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\PermissionTypes;
use App\Constants\EntrepotApi\Sandbox;
use App\Constants\EntrepotApi\ZoomLevels;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\SandboxService;
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

    protected function getEndpointByShareType(string $datastoreId, string $configType, string $shareWith): array
    {
        if ('all_public' === $shareWith) {
            $open = true;
        } elseif ('your_community' === $shareWith) {
            $open = false;
        } else {
            throw new CartesApiException('Valeur du champ [share_with] est invalide', Response::HTTP_BAD_REQUEST, ['share_with' => $shareWith]);
        }

        $endpoints = $this->datastoreApiService->getEndpointsList($datastoreId, [
            'type' => $configType,
            'open' => $open,
        ]);

        if (0 === count($endpoints)) {
            throw new CartesApiException("Aucun point d'accès (endpoint) du datastore ne peut convenir à la demande", Response::HTTP_BAD_REQUEST, ['share_with' => $shareWith]);
        }

        return $endpoints[0]['endpoint'];
    }

    /**
     * @param array<mixed> $offering
     */
    protected function addPermissionForCurrentCommunity(string $datastoreId, array $offering): void
    {
        $datastore = $this->datastoreApiService->get($datastoreId);
        $this->addPermissionForCommunity($datastoreId, $datastore['community']['_id'], $offering);
    }

    /**
     * @param array<mixed> $offering
     */
    protected function addPermissionForCommunity(string $producerDatastoreId, string $consumerCommunityId, array $offering): void
    {
        $permissions = $this->datastoreApiService->getPermissions($producerDatastoreId);
        $offeringId = $offering['_id'];

        $offeringPermissions = array_filter($permissions, function ($permission) use ($offeringId) {
            return isset($permission['offerings']) && in_array($offeringId, array_column($permission['offerings'], '_id'));
        });

        $isPermission = array_reduce($offeringPermissions, function ($carry, $permission) use ($consumerCommunityId) {
            return $carry || (isset($permission['beneficiary']['_id']) && $permission['beneficiary']['_id'] === $consumerCommunityId);
        }, false);

        if ($isPermission) {
            return;
        }

        $endDate = new \DateTime();
        $endDate->add(new \DateInterval('P6M')); // date du jour + 6 mois
        $endDate->setTime(23, 59, 0);

        $permissionRequestBody = [
            'end_date' => $endDate->format(\DateTime::ATOM),
            'licence' => sprintf('Utilisation de %s', $offering['layer_name']),
            'offerings' => [$offering['_id']],
            'type' => PermissionTypes::COMMUNITY,
            'only_oauth' => false,
            'communities' => [$consumerCommunityId],
        ];

        $this->datastoreApiService->addPermission($producerDatastoreId, $permissionRequestBody);
    }

    /**
     * @param array<mixed> $pyramid
     *
     * @return array
     */
    protected function getPyramidZoomLevels(array $pyramid)
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
}
