<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\Form\FeatureInfoFormDTO;
use App\Dto\Services\Form\ServiceEditFormDTO;
use App\Dto\Services\Form\ServicePublishFormDTO;
use App\Dto\Services\Form\WfsTableEditFormDTO;
use App\Dto\Services\Form\WfsTableFormDTO;
use App\Exception\AppException;
use App\Services\DatastorePrefixValidator;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\Rok4StyleFileService;
use App\Services\EntrepotApi\ServiceConfigurationRequestBuilder;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\EntrepotApi\WmsVectorFeatureInfoService;
use App\Services\EntrepotApi\WmsVectorStyleFileService;
use App\Services\MultipartPayloadMapper;
use App\Services\ServiceFormFileValidator;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Exception\ValidationFailedException;

#[Route(
    '/api/datastores/{datastoreId}/services',
    name: 'cartesgouvfr_api_service_',
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] services', description: 'Flux : offre de l’Entrepôt avec sa configuration')]
final class ServiceController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly ConfigurationApiService $configurationApiService,
        private readonly CartesServiceApiService $cartesServiceApiService,
        private readonly MultipartPayloadMapper $multipartPayloadMapper,
        private readonly ServiceFormFileValidator $serviceFormFileValidator,
        private readonly WmsVectorStyleFileService $wmsVectorStyleFileService,
        private readonly WmsVectorFeatureInfoService $wmsVectorFeatureInfoService,
        private readonly Rok4StyleFileService $rok4StyleFileService,
        private readonly StoredDataApiService $storedDataApiService,
        private readonly DatastorePrefixValidator $datastorePrefixValidator,
    ) {
    }

    private const STORED_DATA_TYPES = [
        ConfigurationTypes::WFS => [StoredDataTypes::VECTOR_DB],
        ConfigurationTypes::WMSVECTOR => [StoredDataTypes::VECTOR_DB],
        ConfigurationTypes::WMSRASTER => [StoredDataTypes::ROK4_PYRAMID_RASTER],
        ConfigurationTypes::WMTSTMS => [StoredDataTypes::ROK4_PYRAMID_RASTER, StoredDataTypes::ROK4_PYRAMID_VECTOR],
    ];

    /** Publication : multipart `data` (ServicePublishFormDTO), `thumbnail`, `attribution_logo` et, en WMS vecteur, un fichier SLD `style_files[<table>]` par table. */
    #[Route('', name: 'publish_service', methods: ['POST'])]
    public function publishService(string $datastoreId, Request $request): JsonResponse
    {
        $requestedType = json_decode((string) $request->request->get('data'), true)['type'] ?? null;
        $groups = in_array($requestedType, ServicePublishFormDTO::TYPES, true) ? ['Default', $requestedType] : ['Default'];
        $dto = $this->multipartPayloadMapper->map($request, ServicePublishFormDTO::class, groups: $groups);
        [$thumbnail, $attributionLogo] = $this->serviceFormFileValidator->images($request, 'thumbnail', 'attribution_logo');
        $styleFiles = ConfigurationTypes::WMSVECTOR === $dto->type ? $this->serviceFormFileValidator->styleFiles($request, $dto->selected_tables) : [];

        // contrôles avant tout dépôt de fichier
        $this->datastorePrefixValidator->assertLayerName($datastoreId, $dto->technical_name);
        $storedData = $this->storedDataApiService->get($datastoreId, $dto->stored_data_id)->array();
        if (!in_array($storedData['type'] ?? null, self::STORED_DATA_TYPES[$dto->type], true)) {
            throw new AppException('Ce jeu de données ne peut pas être publié dans ce type de flux', Response::HTTP_BAD_REQUEST, ['type' => $dto->type, 'stored_data_type' => $storedData['type'] ?? null]);
        }

        $usedData = ['stored_data' => $dto->stored_data_id];
        if (in_array($storedData['type'], [StoredDataTypes::ROK4_PYRAMID_RASTER, StoredDataTypes::ROK4_PYRAMID_VECTOR], true)) {
            $usedData = ServiceConfigurationRequestBuilder::getPyramidZoomLevels($storedData) + $usedData;
        }
        $base = ['used_data' => [$usedData]];
        $onConfigurationCreated = null;
        $onRollback = null;

        if (ConfigurationTypes::WMSVECTOR === $dto->type) {
            $this->assertFeatureInfoAttributes($dto, $dto->featureinfo, $storedData);
            // nom temporaire : l’identifiant de la configuration n’existe pas encore
            $tmpId = 'tmp_'.Uuid::v4();
            $staticIds = $this->wmsVectorStyleFileService->upload($datastoreId, $styleFiles, $tmpId);
            try {
                $ftlIds = null === $dto->featureinfo ? [] : $this->wmsVectorFeatureInfoService->upload($datastoreId, $dto->featureinfo->format, $dto->featureinfo->attributes, $tmpId);
            } catch (\Throwable $th) {
                $this->wmsVectorStyleFileService->removeQuietly($datastoreId, $staticIds);
                throw $th;
            }
            $typeInfos = ServiceConfigurationRequestBuilder::buildTypeInfos($dto->type, $dto, $base, $staticIds, $ftlIds);
            // renommage avant l’offre : un échec annule encore la configuration
            $onConfigurationCreated = function (string $configurationId) use ($datastoreId, $staticIds, $ftlIds): void {
                $this->wmsVectorStyleFileService->rename($datastoreId, $staticIds, $configurationId);
                $this->wmsVectorFeatureInfoService->rename($datastoreId, $ftlIds, $configurationId);
            };
            // après l’offre, les fichiers restent : le flux les utilise
            $onRollback = fn () => $this->wmsVectorStyleFileService->removeQuietly($datastoreId, [...array_values($staticIds), ...array_values($ftlIds)]);
        } elseif (StoredDataTypes::ROK4_PYRAMID_RASTER === $storedData['type']) {
            $configType = ConfigurationTypes::WMSRASTER === $dto->type ? 'wmsr' : 'wmts';
            $legendStaticId = $this->rok4StyleFileService->upload($datastoreId, $storedData, $configType, ServiceConfigurationRequestBuilder::getPyramidZoomLevels($storedData));
            $typeInfos = ServiceConfigurationRequestBuilder::buildTypeInfos($dto->type, $dto, $base + ['styles' => [$legendStaticId]]);
            $onConfigurationCreated = fn (string $configurationId) => $this->rok4StyleFileService->rename($datastoreId, $legendStaticId, $configurationId, $configType);
            $onRollback = fn () => $this->rok4StyleFileService->removeQuietly($datastoreId, $legendStaticId);
        } else {
            $typeInfos = ServiceConfigurationRequestBuilder::buildTypeInfos($dto->type, $dto, $base);
        }

        $offering = $this->cartesServiceApiService->publishFromForm($datastoreId, $storedData, $dto, $typeInfos, $thumbnail, $attributionLogo, $onConfigurationCreated, $onRollback);

        return $this->json($offering, Response::HTTP_CREATED);
    }

    #[Route('/{offeringId}', name: 'get_service', methods: ['GET'], requirements: ['offeringId' => Requirement::UUID_V4])]
    public function getService(string $datastoreId, string $offeringId): JsonResponse
    {
        $offering = $this->cartesServiceApiService->getService($datastoreId, $offeringId);

        return $this->json($offering);
    }

    /** Modification depuis la page du flux : multipart `data` (ServiceEditFormDTO), `thumbnail`, `attribution_logo`. */
    // POST et non PUT ou PATCH : PHP ne lit les fichiers multipart que dans un POST
    #[Route('/{offeringId}', name: 'edit_service', methods: ['POST'], requirements: ['offeringId' => Requirement::UUID_V4])]
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

        // flux occupé refusé avant tout dépôt de fichier
        $this->cartesServiceApiService->assertEditable($offering, $configuration);
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
     * Attributs d’infobulle parmi les colonnes non géométriques des tables : un attribut absent casse tout le GetFeatureInfo de la couche.
     *
     * @param array<mixed> $storedData base vecteur du flux
     */
    private function assertFeatureInfoAttributes(object $dto, ?FeatureInfoFormDTO $featureInfo, array $storedData): void
    {
        if (!$featureInfo instanceof FeatureInfoFormDTO) {
            return;
        }
        $columns = [];
        foreach ($storedData['type_infos']['relations'] ?? [] as $relation) {
            $columns[(string) $relation['name']] = array_keys(array_filter($relation['attributes'] ?? [], fn ($type) => !str_starts_with((string) $type, 'geometry')));
        }

        $violations = new ConstraintViolationList();
        foreach ($featureInfo->attributes as $table => $attributes) {
            if ([] !== array_diff($attributes, array_map(strval(...), $columns[(string) $table] ?? []))) {
                $violations->add(new ConstraintViolation('Un attribut ne fait pas partie de la table', null, [], $dto, "featureinfo.attributes[$table]", $attributes));
            }
        }

        if (count($violations) > 0) {
            throw new UnprocessableEntityHttpException('Validation Failed', new ValidationFailedException($dto, $violations));
        }
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

    #[Route('/{offeringId}', name: 'unpublish_service', methods: ['DELETE'])]
    public function unpublishService(string $datastoreId, string $offeringId): Response
    {
        $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();
        $configuration = $this->cartesServiceApiService->unpublish($datastoreId, $offeringId, $offering);
        $this->cartesServiceApiService->updateCapabilities($datastoreId, [$offering]);

        $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME] ?? null;
        if (is_string($datasheetName)) {
            $this->cartesServiceApiService->refreshDatasheetOnlineResources($datastoreId, $datasheetName);
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
