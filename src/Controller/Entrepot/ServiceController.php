<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\Form\ServiceEditFormDTO;
use App\Dto\Services\Form\WfsTableEditFormDTO;
use App\Dto\Services\Form\WfsTableFormDTO;
use App\Exception\AppException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\WmsVectorStyleFileService;
use App\Services\MultipartPayloadMapper;
use App\Services\ServiceFormFileValidator;
use OpenApi\Attributes as OA;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Exception\ValidationFailedException;

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
        private readonly LoggerInterface $logger,
        private readonly MultipartPayloadMapper $multipartPayloadMapper,
        private readonly ServiceFormFileValidator $serviceFormFileValidator,
        private readonly WmsVectorStyleFileService $wmsVectorStyleFileService,
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

    /** Modification depuis la page du flux : multipart `data` (ServiceEditFormDTO), `thumbnail`, `attribution_logo`. */
    #[Route('/{offeringId}/edit', name: 'edit_service', methods: ['POST'], requirements: ['offeringId' => Requirement::UUID_V4])]
    public function editService(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();
        $configuration = $this->configurationApiService->get($datastoreId, $offering['configuration']['_id'])->array();

        $type = $configuration['type'];
        $editableTypes = [ConfigurationTypes::WFS, ConfigurationTypes::WMSVECTOR, ConfigurationTypes::WMSRASTER, ConfigurationTypes::WMTSTMS];
        if (!in_array($type, $editableTypes, true)) {
            throw new AppException('Ce type de flux ne se modifie pas depuis cette page', Response::HTTP_BAD_REQUEST, ['configuration_type' => $type]);
        }

        $dto = $this->multipartPayloadMapper->map($request, ServiceEditFormDTO::class, groups: ['Default', $type]);
        if (ConfigurationTypes::WFS === $type) {
            $this->assertTablePublicNames($dto, $configuration);
        }
        [$thumbnail, $attributionLogo] = $this->serviceFormFileValidator->images($request, 'thumbnail', 'attribution_logo');

        if (ConfigurationTypes::WMSVECTOR !== $type) {
            return $this->json($this->cartesServiceApiService->editFromForm($datastoreId, $offering, $configuration, $dto, $thumbnail, $attributionLogo));
        }

        /** @var array<string, string> $savedStyleIds fichier de style enregistré par table */
        $savedStyleIds = array_column($configuration['type_infos']['used_data'][0]['relations'] ?? [], 'style', 'name');
        // une clé « 2024 » devient un entier en PHP
        $styleFiles = $this->serviceFormFileValidator->styleFiles($request, $dto->selected_tables, array_map(strval(...), array_keys($savedStyleIds)));

        // nouveau fichier puis suppression de l’ancien après l’enregistrement : un échec laisse le flux intact
        $newStyleIds = $this->wmsVectorStyleFileService->upload($datastoreId, $styleFiles, $configuration['_id']);
        $styleIds = $newStyleIds + array_intersect_key($savedStyleIds, array_flip($dto->selected_tables));
        try {
            $offering = $this->cartesServiceApiService->editFromForm($datastoreId, $offering, $configuration, $dto, $thumbnail, $attributionLogo, $styleIds);
        } catch (\Throwable $th) {
            $this->wmsVectorStyleFileService->removeUnused($datastoreId, $configuration['_id'], [...array_values($savedStyleIds), ...array_values($newStyleIds)]);
            throw $th;
        }

        // fichiers remplacés et tables décochées
        $this->wmsVectorStyleFileService->removeQuietly($datastoreId, array_diff($savedStyleIds, $styleIds));

        return $this->json($offering);
    }

    /**
     * Nom technique de table en minuscules comme à la publication, sauf le nom déjà enregistré d’une table (anciens flux).
     *
     * @param array<mixed> $configuration
     */
    private function assertTablePublicNames(ServiceEditFormDTO $dto, array $configuration): void
    {
        $savedNames = array_column($configuration['type_infos']['used_data'][0]['relations'] ?? [], 'public_name', 'native_name');

        $violations = new ConstraintViolationList();
        foreach ($dto->tables as $index => $table) {
            /** @var WfsTableEditFormDTO $table */
            if ('' === $table->public_name || 1 === preg_match(WfsTableFormDTO::PUBLIC_NAME_PATTERN, $table->public_name)
                || ($savedNames[$table->native_name] ?? null) === $table->public_name) {
                continue;
            }
            $violations->add(new ConstraintViolation(WfsTableFormDTO::PUBLIC_NAME_MESSAGE, null, [], $dto, "tables[$index].public_name", $table->public_name));
        }

        if (count($violations) > 0) {
            throw new UnprocessableEntityHttpException('Validation Failed', new ValidationFailedException($dto, $violations));
        }
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
        } catch (\Exception $e) {
            // la dépublication a réussi : un échec des capabilities ne doit pas la faire paraître en erreur
            $this->logger->warning('{class}: Failed to update capabilities after unpublishing offering {offeringId}: {error}', [
                'class' => self::class,
                'offeringId' => $offeringId,
                'exception' => $e,
                'error' => $e->getMessage(),
            ]);
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
