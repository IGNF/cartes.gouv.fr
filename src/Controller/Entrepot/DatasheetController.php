<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationStatuses;
use App\Constants\EntrepotApi\StoredDataTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Datasheet\DatasheetMetadataDTO;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\CartesStoredDataApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\MetadataApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\EntrepotApi\UploadApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/datasheet',
    name: 'cartesgouvfr_api_datasheet_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[cartes.gouv.fr] datasheet', description: 'Une fiche de données sur cartes.gouv.fr')]
class DatasheetController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private UploadApiService $uploadApiService,
        private StoredDataApiService $storedDataApiService,
        private ConfigurationApiService $configurationApiService,
        private AnnexeApiService $annexeApiService,
        private CartesServiceApiService $cartesServiceApiService,
        private MetadataApiService $metadataApiService,
        private CartesStoredDataApiService $cartesStoredDataApiService,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getDatasheetList(string $datastoreId): JsonResponse
    {
        $pendingUploads = $this->uploadApiService->getAll($datastoreId, [
            'sort' => 'last_event,desc',
            'fields' => 'tags',
        ]);
        $pendingStoredData = $this->storedDataApiService->getAll($datastoreId, [
            'sort' => 'last_event,desc',
            'fields' => 'tags',
        ]);
        $pendingMetadata = $this->metadataApiService->getAll($datastoreId);
        $pendingConfigurations = $this->configurationApiService->getAll($datastoreId, [
            'status' => ConfigurationStatuses::PUBLISHED,
            'fields' => 'tags',
        ]);
        $pendingAnnexes = $this->annexeApiService->getAll($datastoreId, null, null, ['type=thumbnail']);

        $uploads = $pendingUploads->resolve();

        $uploadDatasheetNames = array_map(function ($upload) {
            if (isset($upload['tags'][CommonTags::DATASHEET_NAME])) {
                return $upload['tags'][CommonTags::DATASHEET_NAME];
            }
        }, $uploads);

        $storedDataList = $pendingStoredData->resolve();

        $storedDataDatasheetNames = array_map(function ($storedData) {
            if (isset($storedData['tags'][CommonTags::DATASHEET_NAME])) {
                return $storedData['tags'][CommonTags::DATASHEET_NAME];
            }
        }, $storedDataList);

        $metadataList = $pendingMetadata->resolve();

        $metadataDatasheetNames = array_map(function ($apiMetadata) {
            if (isset($apiMetadata['tags'][CommonTags::DATASHEET_NAME])) {
                return $apiMetadata['tags'][CommonTags::DATASHEET_NAME];
            }
        }, $metadataList);

        $uniqueDatasheetNames = array_unique(array_merge($uploadDatasheetNames, $storedDataDatasheetNames, $metadataDatasheetNames));
        $uniqueDatasheetNames = array_filter($uniqueDatasheetNames);
        $uniqueDatasheetNames = array_values($uniqueDatasheetNames);

        $datasheetList = [];

        $configurations = $pendingConfigurations->resolve();
        $annexes = $pendingAnnexes->resolve();

        foreach ($uniqueDatasheetNames as $datasheetName) {
            $datasheetList[] = $this->getBasicInfo($datastoreId, $datasheetName, $configurations, $annexes);
        }

        return $this->json($datasheetList);
    }

    /**
     * @SuppressWarnings(UnusedFormalParameter)
     */
    #[Route('', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, #[MapRequestPayload] DatasheetMetadataDTO $dto): JsonResponse
    {
        // TODO: utiliser $datastoreId pour publier via MetadataApiService (génération XML ISO 19139).
        // TODO: la vignette est envoyée séparément via cartesgouvfr_api_annexe_thumbnail_add — voir front.
        // TODO: les logos producteur n'ont pas encore d'endpoint Entrepôt (champ optionnel, hors périmètre).
        // Pour l'instant : validation uniquement (assurée par MapRequestPayload), on renvoie le DTO validé.
        return $this->json($dto, Response::HTTP_OK);
    }

    /**
     * @SuppressWarnings(UnusedFormalParameter)
     */
    #[Route('/{datasheetName}', name: 'edit', methods: ['PUT'])]
    public function edit(string $datastoreId, string $datasheetName, #[MapRequestPayload] DatasheetMetadataDTO $dto): JsonResponse
    {
        // TODO: utiliser $datastoreId + $datasheetName pour récupérer et mettre à jour
        //       la métadonnée existante via MetadataApiService (régénération XML ISO 19139).
        // TODO: la vignette est gérée séparément via l'endpoint annexe — voir front.
        return $this->json($dto, Response::HTTP_OK);
    }

    #[Route('/{datasheetName}', name: 'get', methods: ['GET'])]
    public function getDetailed(string $datastoreId, string $datasheetName): JsonResponse
    {
        // recherche d'entités API qui représente une fiche de données : upload, stored_data, metadata
        $pendingUploadList = $this->uploadApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
            'fields' => 'name,description,type,open,status,srs,contact,size,last_event,tags,creation,bbox',
        ]);

        $pendingStoredDataList = $this->storedDataApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
            'fields' => 'name,description,type,open,status,srs,contact,edition,size,last_event,tags,creation,bbox,public_activity',
        ]);

        $uploadList = $pendingUploadList->resolve();
        $storedDataList = $pendingStoredDataList->resolve();

        $vectorDbList = array_filter($storedDataList, function ($storedData) {
            return StoredDataTypes::VECTOR_DB === $storedData['type'];
        });
        $vectorDbList = array_values($vectorDbList);

        // Pyramid vector
        $pyramidVectorList = array_filter($storedDataList, function ($storedData) {
            return StoredDataTypes::ROK4_PYRAMID_VECTOR === $storedData['type'];
        });
        $pyramidVectorList = array_values($pyramidVectorList);

        // Pyramid raster
        $pyramidRasterList = array_filter($storedDataList, function ($storedData) {
            return StoredDataTypes::ROK4_PYRAMID_RASTER === $storedData['type'];
        });
        $pyramidRasterList = array_values($pyramidRasterList);

        if (0 === count($uploadList) && 0 === count($storedDataList)) {
            $metadataList = $this->metadataApiService->getAll($datastoreId, [
                'tags' => [
                    CommonTags::DATASHEET_NAME => $datasheetName,
                ],
            ])->resolve();

            if (0 === count($metadataList)) {
                throw new CartesApiException("La fiche de donnée [$datasheetName] n'existe pas", Response::HTTP_NOT_FOUND);
            }
        }

        $datasheet = $this->getBasicInfo($datastoreId, $datasheetName);

        return $this->json([
            ...$datasheet,
            'vector_db_list' => $vectorDbList,
            'pyramid_vector_list' => $pyramidVectorList,
            'pyramid_raster_list' => $pyramidRasterList,
            'upload_list' => $uploadList,
        ]);
    }

    #[Route('/{datasheetName}/services', name: 'get_services', methods: ['GET'])]
    public function getServices(string $datastoreId, string $datasheetName): JsonResponse
    {
        $storedDataList = $this->storedDataApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
            'fields' => 'status', // on n'a besoin que de l'_id qui est toujours présent, mais on ne peut pas demander "_id" via "fields", donc "status" parce que c'est un champ léger et qui est toujours présent
        ])->resolve();

        $offeringsById = $this->getOfferingsOfStoredData($datastoreId, $storedDataList);
        $offeringsById = $this->cartesServiceApiService->getServicesFromOfferings($datastoreId, $offeringsById, false);

        return $this->json(array_values($offeringsById));
    }

    /**
     * Offerings détaillées publiées à partir des stored_data données, listes lancées en parallèle.
     *
     * @param array<array<mixed>> $storedDataList
     *
     * @return array<string,array<mixed>> clé : offeringId, valeur : offering
     */
    private function getOfferingsOfStoredData(string $datastoreId, array $storedDataList): array
    {
        $pendingAllByStoredData = [];
        foreach ($storedDataList as $storedData) {
            $pendingAllByStoredData[] = $this->configurationApiService->getAllOfferingsDetailed($datastoreId, [
                'stored_data' => $storedData['_id'],
            ]);
        }

        $offeringsById = [];
        foreach ($pendingAllByStoredData as $pendingAll) {
            foreach ($pendingAll->resolve() as $offering) {
                $offeringsById[$offering['_id']] = $offering;
            }
        }

        return $offeringsById;
    }

    /**
     * @param ?array<array<mixed>> $configurations
     * @param ?array<array<mixed>> $annexes
     */
    private function getBasicInfo(string $datastoreId, string $datasheetName, ?array $configurations = null, ?array $annexes = null): array
    {
        // recherche du nombre de services publiés à partir de $configurations si fourni, sinon requête API
        if (null !== $configurations) {
            $datasheetConfigurations = array_filter($configurations, function ($configuration) use ($datasheetName) {
                if (isset($configuration['tags'][CommonTags::DATASHEET_NAME])) {
                    return $configuration['tags'][CommonTags::DATASHEET_NAME] === $datasheetName;
                }

                return false;
            });
        } else {
            $datasheetConfigurations = $this->configurationApiService->getAll($datastoreId, [
                'tags' => [
                    CommonTags::DATASHEET_NAME => $datasheetName,
                ],
                'status' => ConfigurationStatuses::PUBLISHED,
            ])->resolve();
        }
        $nbPublications = count($datasheetConfigurations);

        // recherche de vignette à partir de $annexes si fourni, sinon requête API
        if (null !== $annexes) {
            $datasheetAnnexes = array_filter($annexes, function ($annexe) use ($datasheetName) {
                return in_array(CommonTags::DATASHEET_NAME."=$datasheetName", $annexe['labels']);
            });
            $datasheetAnnexes = array_values($datasheetAnnexes);
        } else {
            $datasheetAnnexes = $this->annexeApiService->getAll($datastoreId, null, null, ["datasheet_name=$datasheetName", 'type=thumbnail'])->resolve();
        }

        $thumbnail = null;
        if (count($datasheetAnnexes) > 0) {
            $thumbnail = $datasheetAnnexes[0];
            $thumbnail['url'] = $this->annexeApiService->getAbsoluteUrl($datastoreId, $thumbnail);
        }

        return [
            'name' => $datasheetName,
            'nb_publications' => $nbPublications,
            'thumbnail' => $thumbnail,
        ];
    }

    #[Route('/{datasheetName}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $datasheetName): Response
    {
        try {
            $datasheetTags = ['tags' => [CommonTags::DATASHEET_NAME => $datasheetName]];
            $pendingUploadList = $this->uploadApiService->getAll($datastoreId, [...$datasheetTags, 'fields' => 'status,tags']);
            $pendingStoredDataList = $this->storedDataApiService->getAll($datastoreId, [...$datasheetTags, 'fields' => 'type']);
            $pendingMetadataList = $this->metadataApiService->getAll($datastoreId, $datasheetTags);

            $uploadList = $pendingUploadList->resolve();
            $storedDataList = $pendingStoredDataList->resolve();
            $metadataList = $pendingMetadataList->resolve();

            if (0 === count($uploadList) && 0 === count($storedDataList) && 0 === count($metadataList)) {
                throw new CartesApiException("La fiche de donnée [$datasheetName] n'existe pas", Response::HTTP_NOT_FOUND);
            }

            // suppr des services (config et offering)
            foreach ($this->getOfferingsOfStoredData($datastoreId, $storedDataList) as $offering) {
                $this->cartesServiceApiService->unpublish($datastoreId, $offering['_id'], $offering);
            }

            // suppr des uploads
            foreach ($uploadList as $upload) {
                $this->uploadApiService->remove($datastoreId, $upload['_id'], $upload)->await();
            }

            // suppr des stored_data (bases vecteur et pyramides)
            $deletableTypes = [StoredDataTypes::VECTOR_DB, StoredDataTypes::ROK4_PYRAMID_VECTOR, StoredDataTypes::ROK4_PYRAMID_RASTER];
            foreach ($storedDataList as $storedData) {
                if (in_array($storedData['type'], $deletableTypes, true)) {
                    $this->cartesStoredDataApiService->delete($datastoreId, $storedData['_id']);
                }
            }

            // suppr des métadonnées
            if (count($metadataList) > 0) {
                $metadata = $metadataList[0];

                foreach ($metadata['endpoints'] as $metadataEndpoint) {
                    $this->metadataApiService->unpublish($datastoreId, $metadata['file_identifier'], $metadataEndpoint['_id'])->await();
                }

                $this->metadataApiService->delete($datastoreId, $metadata['_id'])->await();
            }

            // TODO : autres données à supprimer
            // Suppression des annexes : vignette, documents associés à la fiche de données etc
            // listées après la dépublication des services, qui supprime déjà les annexes de style et de capabilities
            $annexes = $this->annexeApiService->getAll($datastoreId, null, null, ["datasheet_name=$datasheetName"])->resolve();
            foreach ($annexes as $annexe) {
                $this->annexeApiService->remove($datastoreId, $annexe['_id'])->await();
            }

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
