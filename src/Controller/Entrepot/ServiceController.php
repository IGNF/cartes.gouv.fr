<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\Form\ServiceEditFormDTO;
use App\Dto\Services\Form\WfsTableEditFormDTO;
use App\Dto\Services\Form\WfsTableFormDTO;
use App\Exception\AppException;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
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
    ) {
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
