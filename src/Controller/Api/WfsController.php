<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\OfferingTypes;
use App\Dto\WfsAddDTO;
use App\Dto\WfsTableDTO;
use App\Entity\CswMetadata\CswHierarchyLevel;
use App\Entity\CswMetadata\CswLanguage;
use App\Entity\CswMetadata\CswMetadata;
use App\Entity\CswMetadata\CswMetadataLayer;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\CartesServiceApi;
use App\Services\CswMetadataHelper;
use App\Services\EntrepotApiService;
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
        CswMetadataHelper $metadataHelper
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
            $this->createOrUpdateMetadata($dto, $metadataHelper, $datastoreId, $datasheetName);

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
        CswMetadataHelper $metadataHelper
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
            $this->createOrUpdateMetadata($dto, $metadataHelper, $datastoreId, $datasheetName);

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

    private function createOrUpdateMetadata(WfsAddDTO $dto, CswMetadataHelper $metadataHelper, string $datastoreId, string $datasheetName): void
    {
        $metadataList = $this->entrepotApiService->metadata->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $metadataEndpoint = $this->getEndpointByShareType($datastoreId, 'METADATA', 'all_public');

        // apiMetadata : objet metadata issu de l'API Entrepot
        // cswMetadata : objet metadata issu du fichier lié à la metadata API

        if (0 === count($metadataList)) {
            // nouvelle métadonnée à créer

            $newCswMetadata = $this->getNewCswMetadata($dto, $datastoreId, $datasheetName);

            $newMetadataFilePath = $metadataHelper->saveToFile($newCswMetadata);

            $apiMetadata = $this->entrepotApiService->metadata->add($datastoreId, $newMetadataFilePath);
            $apiMetadata = $this->entrepotApiService->metadata->addTags($datastoreId, $apiMetadata['_id'], [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ]);

            $this->entrepotApiService->metadata->publish($datastoreId, $apiMetadata['file_identifier'], $metadataEndpoint['_id']);
        } else {
            // une métadonnée existe déjà qu'on va mettre à jour

            $oldMetadata = $metadataList[0];

            $oldMetadataFileXml = $this->entrepotApiService->metadata->downloadFile($datastoreId, $oldMetadata['_id']);
            $oldCswMetadata = $metadataHelper->fromXml($oldMetadataFileXml);

            $newCswMetadata = $this->getNewCswMetadata($dto, $datastoreId, $datasheetName);

            $newMetadataFilePath = $metadataHelper->saveToFile($newCswMetadata);

            // suppression et recréation de métadonnées si changement de file_identifier
            if ($oldCswMetadata->fileIdentifier !== $newCswMetadata->fileIdentifier) {
                $this->entrepotApiService->metadata->unpublish($datastoreId, $oldCswMetadata->fileIdentifier, $metadataEndpoint['_id']);
                $this->entrepotApiService->metadata->delete($datastoreId, $oldMetadata['_id']);

                $apiMetadata = $this->entrepotApiService->metadata->add($datastoreId, $newMetadataFilePath);
            } else {
                $apiMetadata = $this->entrepotApiService->metadata->replaceFile($datastoreId, $oldMetadata['_id'], $newMetadataFilePath);
            }
            $apiMetadata = $this->entrepotApiService->metadata->addTags($datastoreId, $apiMetadata['_id'], $oldMetadata['tags']);

            if (0 === count($apiMetadata['endpoints'])) {
                $this->entrepotApiService->metadata->publish($datastoreId, $apiMetadata['file_identifier'], $metadataEndpoint['_id']);
            }
        }
    }

    private function getNewCswMetadata(WfsAddDTO $dto, string $datastoreId, string $datasheetName): CswMetadata
    {
        $layers = $this->getMetadataLayers($datastoreId, $datasheetName);

        $language = $dto->languages[0] ?
             new CswLanguage($dto->languages[0]['code'], $dto->languages[0]['language'])
             : CswLanguage::default();

        return CswMetadata::createFromParams($dto->identifier, CswHierarchyLevel::from('' === $dto->resource_genealogy ? 'series' : $dto->resource_genealogy), $language, $dto->charset, $dto->public_name, $dto->description, $dto->creation_date, $dto->category, $dto->email_contact, $dto->organization, $dto->organization_email, $layers);
    }

    /**
     * @return array<CswMetadataLayer>
     */
    private function getMetadataLayers(string $datastoreId, string $datasheetName): array
    {
        $configList = $this->entrepotApiService->configuration->getAllDetailed($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $layers = array_map(function (array $configuration) use ($datastoreId) {
            $configRelations = $configuration['type_infos']['used_data'][0]['relations'];

            $offering = $this->entrepotApiService->configuration->getConfigurationOfferings($datastoreId, $configuration['_id'])[0];
            $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offering['_id']);

            $serviceEndpoint = $this->entrepotApiService->datastore->getEndpoint($datastoreId, $offering['endpoint']['_id']);

            $relationLayers = array_map(function ($relation) use ($offering, $serviceEndpoint) {
                $layerName = null;
                $endpointType = null;

                switch ($offering['type']) {
                    case OfferingTypes::WFS:
                        $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['native_name']);
                        $endpointType = 'OGC:WFS';
                        break;

                    case OfferingTypes::WMSVECTOR:
                        $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['name']);
                        $endpointType = 'OGC:WMS';
                        break;

                    case OfferingTypes::WMTSTMS:
                        $layerName = $offering['layer_name'];
                        $endpointType = 'OGC:TMS';
                        break;
                    default:
                        $layerName = $offering['layer_name'];
                        $endpointType = '';
                        break;
                }

                return new CswMetadataLayer($layerName, $endpointType, $serviceEndpoint['endpoint']['urls'][0]['url'], $offering['_id']);
            }, $configRelations);

            return $relationLayers;
        }, $configList);

        $layers = array_merge(...$layers);

        return $layers;
    }
}
