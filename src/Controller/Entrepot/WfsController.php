<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\Sandbox;
use App\Controller\ApiControllerInterface;
use App\Dto\WfsAddDTO;
use App\Dto\WfsTableDTO;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/stored_data/{storedDataId}/wfs',
    name: 'cartesgouvfr_api_wfs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class WfsController extends ServiceController implements ApiControllerInterface
{
    public function __construct(
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private StoredDataApiService $storedDataApiService,
        CartesServiceApiService $cartesServiceApiService,
        private CapabilitiesService $capabilitiesService,
        private CartesMetadataApiService $cartesMetadataApiService,
        ParameterBagInterface $params
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApiService, $capabilitiesService, $cartesMetadataApiService, $params);
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(
        string $datastoreId,
        string $storedDataId,
        #[MapRequestPayload] WfsAddDTO $dto,
    ): JsonResponse {
        try {
            $datastore = $this->datastoreApiService->get($datastoreId);

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $storedDataId, false, $datastore['community']['_id']);

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

            // Création ou mise à jour du capabilities
            try {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            } catch (\Exception $e) {
            }

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
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
        #[MapRequestPayload] WfsAddDTO $dto,
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

                if (false === $offering['open']) {
                    // création d'une permission pour la communauté actuelle
                    $this->addPermissionForCurrentCommunity($datastoreId, $offering);
                }
            } else {
                $offering = $this->configurationApiService->syncOffering($datastoreId, $offeringId);
            }

            $offering['configuration'] = $configuration;

            // Création ou mise à jour du capabilities
            try {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            } catch (\Exception $e) {
            }

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $formData);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    private function getConfigRequestBody(WfsAddDTO $dto, string $storedDataId, bool $editMode = false, ?string $communityId = null): array
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
            'name' => $dto->public_name,
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
            if (null !== $this->sandboxCommunityId && null !== $communityId && $this->sandboxCommunityId === $communityId) {
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
