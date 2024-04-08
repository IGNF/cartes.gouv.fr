<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\MetadataFields;
use App\Dto\WfsAddDTO;
use App\Dto\WfsTableDTO;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\CartesServiceApi;
use App\Services\EntrepotApiService;
use App\Services\MetadataHelper;
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
        private EntrepotApiService $entrepotApiService,
        private CartesServiceApi $cartesServiceApi,
    ) {
        parent::__construct($entrepotApiService, $cartesServiceApi);
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(
        string $datastoreId,
        string $storedDataId,
        #[MapRequestPayload] WfsAddDTO $dto,
        MetadataHelper $metadataHelper
    ): JsonResponse {
        try {
            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $storedDataId);

            $storedData = $this->entrepotApiService->storedData->get($datastoreId, $storedDataId);
            $datasheetName = $storedData['tags'][CommonTags::DATASHEET_NAME];

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WFS, $dto->share_with);

            // Ajout de la configuration
            $configuration = $this->entrepotApiService->configuration->add($datastoreId, $configRequestBody);
            $configuration = $this->entrepotApiService->configuration->addTags($datastoreId, $configuration['_id'], [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ]);

            // Creation d'une offering
            $offering = $this->entrepotApiService->configuration->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
            $offering['configuration'] = $configuration;

            // création de metadata
            $this->createOrUpdateMetadata($dto, $offering, $endpoint, $metadataHelper, $datastoreId, $datasheetName);

            return $this->json($offering);
        } catch (EntrepotApiException $ex) {
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
        MetadataHelper $metadataHelper
    ): JsonResponse {
        try {
            // récup anciens config et offering
            $oldOffering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
            $oldConfiguration = $this->entrepotApiService->configuration->get($datastoreId, $oldOffering['configuration']['_id']);
            $datasheetName = $oldConfiguration['tags'][CommonTags::DATASHEET_NAME];

            // suppression anciens configs et offering
            $this->cartesServiceApi->wfsUnpublish($datastoreId, $oldOffering, false);

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $storedDataId);

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WFS, $dto->share_with);

            // Ajout de la configuration
            $configuration = $this->entrepotApiService->configuration->add($datastoreId, $configRequestBody);
            $configuration = $this->entrepotApiService->configuration->addTags($datastoreId, $configuration['_id'], $oldConfiguration['tags']);

            // Creation d'une offering
            $offering = $this->entrepotApiService->configuration->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
            $offering['configuration'] = $configuration;

            // création de metadata
            $this->createOrUpdateMetadata($dto, $offering, $endpoint, $metadataHelper, $datastoreId, $datasheetName, $oldOffering['_id']);

            return $this->json($offering);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    private function getConfigRequestBody(WfsAddDTO $dto, string $storedDataId): array
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
            'layer_name' => $dto->technical_name,
            'attribution' => [
                'title' => $dto->attribution_text,
                'url' => $dto->attribution_url,
            ],
            'type_infos' => [
                'used_data' => [[
                    'relations' => $relations,
                    'stored_data' => $storedDataId,
                ]],
            ],
        ];

        return $body;
    }

    /**
     * @param array<mixed> $offering
     * @param array<mixed> $serviceEndpoint
     */
    private function createOrUpdateMetadata(WfsAddDTO $dto, array $offering, array $serviceEndpoint, MetadataHelper $metadataHelper, string $datastoreId, string $datasheetName, ?string $oldOfferingId = null): void
    {
        $metadataList = $this->entrepotApiService->metadata->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $metadataEndpoint = $this->getEndpointByShareType($datastoreId, 'METADATA', 'all_public');

        if (0 === count($metadataList)) {
            // nouvelle métadonnée à créer

            $newMetadataArray = $this->getMetadataArray($dto, $offering, $serviceEndpoint);

            $newMetadataXml = $metadataHelper->convertArrayToXml($newMetadataArray);
            $newMetadataFilePath = $metadataHelper->saveToFile($newMetadataXml);

            $metadata = $this->entrepotApiService->metadata->add($datastoreId, $newMetadataFilePath);
            $metadata = $this->entrepotApiService->metadata->addTags($datastoreId, $metadata['_id'], [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ]);

            $this->entrepotApiService->metadata->publish($datastoreId, $metadata['file_identifier'], $metadataEndpoint['_id']);
        } else {
            // une métadonnée existe déjà qu'on va mettre à jour

            $oldMetadata = $metadataList[0];

            $oldMetadataFileXml = $this->entrepotApiService->metadata->downloadFile($datastoreId, $oldMetadata['_id']);
            $oldMetadataFileArray = $metadataHelper->convertXmlToArray($oldMetadataFileXml);

            // suppression layers correspondantes à l'ancienne offering
            $oldLayers = array_filter($oldMetadataFileArray[MetadataFields::LAYERS], fn ($l) => $l[MetadataFields::LAYER_OFFERING_ID] !== $oldOfferingId);

            $newMetadataArray = $this->getMetadataArray($dto, $offering, $serviceEndpoint, $oldLayers);
            $newMetadataXml = $metadataHelper->convertArrayToXml($newMetadataArray);
            $newMetadataFilePath = $metadataHelper->saveToFile($newMetadataXml);

            // suppression et recréation de métadonnées si changement de file_identifier
            if ($oldMetadataFileArray[MetadataFields::FILE_IDENTIFIER] !== $newMetadataArray[MetadataFields::FILE_IDENTIFIER]) {
                $this->entrepotApiService->metadata->unpublish($datastoreId, $oldMetadataFileArray[MetadataFields::FILE_IDENTIFIER], $metadataEndpoint['_id']);
                $this->entrepotApiService->metadata->delete($datastoreId, $oldMetadata['_id']);

                $metadata = $this->entrepotApiService->metadata->add($datastoreId, $newMetadataFilePath);
            } else {
                $metadata = $this->entrepotApiService->metadata->replaceFile($datastoreId, $oldMetadata['_id'], $newMetadataFilePath);
            }
            $metadata = $this->entrepotApiService->metadata->addTags($datastoreId, $metadata['_id'], $oldMetadata['tags']);

            $this->entrepotApiService->metadata->publish($datastoreId, $metadata['file_identifier'], $metadataEndpoint['_id']);
        }
    }

    /**
     * @param array<mixed> $offering
     * @param array<mixed> $serviceEndpoint
     * @param array<mixed> $oldLayers
     */
    private function getMetadataArray(WfsAddDTO $dto, array $offering, array $serviceEndpoint, ?array $oldLayers = []): array
    {
        $layers = array_map(function (WfsTableDTO $tableInfo) use ($offering, $serviceEndpoint) {
            return [
                MetadataFields::LAYER_NAME => sprintf('%s:%s', $offering['layer_name'], $tableInfo->native_name),
                MetadataFields::LAYER_ENDPOINT_TYPE => 'OGC:WFS',
                MetadataFields::LAYER_ENDPOINT_URL => $serviceEndpoint['urls'][0]['url'],
                MetadataFields::LAYER_OFFERING_ID => $offering['_id'],
            ];
        }, iterator_to_array($dto->table_infos));

        $layers = array_merge($oldLayers, $layers);

        return [
            MetadataFields::HIERARCHY_LEVEL => '' === $dto->resource_genealogy ? 'series' : $dto->resource_genealogy,
            MetadataFields::LANGUAGE => $dto->languages[0] ?? 'fra',
            MetadataFields::CHARSET => $dto->charset ?? 'utf8',
            MetadataFields::FILE_IDENTIFIER => $dto->identifier,
            MetadataFields::TITLE => $dto->public_name,
            MetadataFields::ABSTRACT => $dto->description,
            MetadataFields::CREATION_DATE => (new \DateTime($dto->creation_date))->format('Y-m-d'),
            MetadataFields::THEMATIC_CATEGORIES => $dto->category,
            MetadataFields::CONTACT_EMAIL => $dto->email_contact,
            MetadataFields::ORGANISATION_NAME => $dto->organization,
            MetadataFields::ORGANISATION_EMAIL => $dto->organization_email,
            MetadataFields::LAYERS => $layers,
        ];
    }
}
