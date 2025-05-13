<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\Sandbox;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\Wfs\WfsServiceDTO;
use App\Dto\Services\Wfs\WfsTableDTO;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\SandboxService;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/stored_data/{storedDataId}/wfs',
    name: 'cartesgouvfr_api_wfs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[cartes.gouv.fr] WFS', description: 'Création/modification des services WFS')]
class WfsController extends ServiceController implements ApiControllerInterface
{
    public function __construct(
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private StoredDataApiService $storedDataApiService,
        CartesServiceApiService $cartesServiceApiService,
        private CapabilitiesService $capabilitiesService,
        private CartesMetadataApiService $cartesMetadataApiService,
        SandboxService $sandboxService,
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApiService, $capabilitiesService, $cartesMetadataApiService, $sandboxService);
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(
        string $datastoreId,
        string $storedDataId,
        #[MapRequestPayload] WfsServiceDTO $dto,
    ): JsonResponse {
        try {
            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $storedDataId, false, $datastoreId);

            $storedData = $this->storedDataApiService->get($datastoreId, $storedDataId);
            $datasheetName = $storedData['tags'][CommonTags::DATASHEET_NAME];

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WFS, $dto->share_with);

            // Ajout de la configuration
            $configuration = $this->configurationApiService->add($datastoreId, $configRequestBody);
            $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ]);

            // Creation d'une offering
            try {
                $offering = $this->configurationApiService->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
                $offering['configuration'] = $configuration;
            } catch (\Throwable $th) {
                // si la création de l'offering plante, on défait la création de la config
                $this->configurationApiService->remove($datastoreId, $configuration['_id']);
                throw $th;
            }

            // création d'une permission pour la communauté actuelle
            if ('your_community' === $dto->share_with) {
                $this->addPermissionForCurrentCommunity($datastoreId, $offering);
            }

            // création d'une permission pour la communauté config
            if (true === $dto->allow_view_data) {
                $communityId = $this->getParameter('config')['community_id'];
                $this->addPermissionForCommunity($datastoreId, $communityId, $offering);
            }

            // Création ou mise à jour du capabilities
            try {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            } catch (\Exception $e) {
            }

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $formData['identifier'] = Sandbox::LAYERNAME_PREFIX.$formData['identifier'];
            }
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $formData);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * Crée de nouveaux config et offering et supprime les anciens.
     */
    #[Route('/{offeringId}/edit', name: 'edit', methods: ['POST'])]
    public function edit(
        string $datastoreId,
        string $storedDataId,
        string $offeringId,
        #[MapRequestPayload] WfsServiceDTO $dto,
    ): JsonResponse {
        try {
            // récup config et offering existants
            $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id']);
            $datasheetName = $oldConfiguration['tags'][CommonTags::DATASHEET_NAME];

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $storedDataId, true);

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WFS, $dto->share_with);

            // Mise à jour de la configuration
            $configuration = $this->configurationApiService->replace($datastoreId, $oldConfiguration['_id'], $configRequestBody);

            // on recrée l'offering si changement d'endpoint, sinon demande la synchronisation
            if ($oldOffering['open'] !== $endpoint['open']) {
                $this->configurationApiService->removeOffering($datastoreId, $oldOffering['_id']);

                $offering = $this->configurationApiService->addOffering($datastoreId, $oldConfiguration['_id'], $endpoint['_id'], $endpoint['open']);
            } else {
                $offering = $this->configurationApiService->syncOffering($datastoreId, $offeringId);
            }

            if (false === $offering['open']) {
                // création d'une permission pour la communauté config
                if (true === $dto->allow_view_data) {
                    $communityId = $this->getParameter('config')['community_id'];
                    $this->addPermissionForCommunity($datastoreId, $communityId, $offering);
                } else {
                    $communityId = $this->getParameter('config')['community_id'];
                    $permissions = $this->datastoreApiService->getPermissions($datastoreId);

                    $targetPermission = array_filter($permissions, function ($permission) use ($offering, $communityId) {
                        return isset($permission['offerings'])
                            && in_array($offering['_id'], array_column($permission['offerings'], '_id'))
                            && isset($permission['beneficiary']['_id'])
                            && $permission['beneficiary']['_id'] === $communityId;
                    });

                    if (!empty($targetPermission)) {
                        $permissionId = reset($targetPermission)['_id'];
                        $this->datastoreApiService->removePermission($datastoreId, $permissionId);
                    }
                }
                // création d'une permission pour la communauté actuelle
                $this->addPermissionForCurrentCommunity($datastoreId, $offering);
            }

            $offering['configuration'] = $configuration;

            // Création ou mise à jour du capabilities
            try {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            } catch (\Exception $e) {
            }

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $formData['identifier'] = Sandbox::LAYERNAME_PREFIX.$formData['identifier'];
            }
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $formData);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    private function getConfigRequestBody(WfsServiceDTO $dto, string $storedDataId, bool $editMode = false, ?string $datastoreId = null): array
    {
        $relations = [];

        /** @var WfsTableDTO $table */
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
            'type' => ConfigurationTypes::WFS,
            'name' => $dto->service_name,
            'type_infos' => [
                'used_data' => [[
                    'relations' => $relations,
                    'stored_data' => $storedDataId,
                ]],
            ],
        ];

        if (false === $editMode) {
            $body['layer_name'] = $dto->technical_name;

            // rajoute le préfixe "sandbox." si c'est la communauté bac à sable
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $body['layer_name'] = Sandbox::LAYERNAME_PREFIX.$body['layer_name'];
            }
        }

        if ('' !== $dto->attribution_text && '' !== $dto->attribution_url) {
            $body['attribution'] = [
                'title' => $dto->attribution_text,
                'url' => $dto->attribution_url,
            ];
        }

        return $body;
    }
}
