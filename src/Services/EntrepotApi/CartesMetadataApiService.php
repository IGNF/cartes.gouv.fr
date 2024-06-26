<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Entity\CswMetadata\CswHierarchyLevel;
use App\Entity\CswMetadata\CswLanguage;
use App\Entity\CswMetadata\CswMetadata;
use App\Entity\CswMetadata\CswMetadataLayer;
use App\Exception\AppException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\CswMetadataHelper;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Response;

/**
 * Service qui crée ou met à jour une métadonnée.
 *
 * - apiMetadata : objet metadata issu de l'API Entrepot
 * - cswMetadata : objet metadata issu du fichier lié à la metadata API
 */
class CartesMetadataApiService
{
    public function __construct(
        private ParameterBagInterface $parameterBag,
        private DatastoreApiService $datastoreApiService,
        private AnnexeApiService $annexeApiService,
        private MetadataApiService $metadataApiService,
        private ConfigurationApiService $configurationApiService,
        private CswMetadataHelper $cswMetadataHelper,
        private CapabilitiesService $capabilitiesService,
    ) {
    }

    /**
     * Récupère la métadonnée liée à la fiche de données.
     *
     * @return array|null retourne null si aucune métadonnée liée n'a été trouvée
     */
    public function getMetadataByDatasheetName(string $datastoreId, string $datasheetName): ?array
    {
        $metadataList = $this->metadataApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        if (0 === count($metadataList)) {
            return null;
        }

        return $metadataList[0];
    }

    public function getThumbnailUrl(string $datastoreId, string $datasheetName): ?string
    {
        $annexeList = $this->annexeApiService->getAll($datastoreId, null, null, [
            sprintf('%s=%s', CommonTags::DATASHEET_NAME, $datasheetName),
            'type=thumbnail',
        ]);

        if (0 === count($annexeList)) {
            return null;
        }

        $datastore = $this->datastoreApiService->get($datastoreId);

        $annexeUrl = $this->parameterBag->get('annexes_url');

        return $annexeUrl.'/'.$datastore['technical_name'].$annexeList[0]['paths'][0];
    }

    /**
     * Met à jour la liste des flux si une métadonnée existante fait référence à une fiche de données, sinon fait rien.
     */
    public function updateLayers(string $datastoreId, string $datasheetName): void
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (!$apiMetadata) {
            return;
        }

        $apiMetadataXml = $this->metadataApiService->downloadFile($datastoreId, $apiMetadata['_id']);

        $cswMetadata = $this->cswMetadataHelper->fromXml($apiMetadataXml);
        $cswMetadata->layers = $this->getMetadataLayers($datastoreId, $datasheetName);

        $xmlFilePath = $this->cswMetadataHelper->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $apiMetadata['_id'], $xmlFilePath);
    }

    /**
     * Crée ou met à jour la métadonnée liée à la fiche de données.
     *
     * @param array<mixed> $formData
     */
    public function createOrUpdate(string $datastoreId, string $datasheetName, ?array $formData = null): void
    {
        $apiMetadata = $this->getMetadataByDatasheetName($datastoreId, $datasheetName);

        if (null === $apiMetadata) {
            // nouvelle métadonnée à créer

            if (null === $formData) { // n'est pas censé arriver
                throw new AppException('formData doit être non null si création de la métadonnée', Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $this->createMetadata($datastoreId, $datasheetName, $formData);
        } else {
            // une métadonnée existe déjà qu'on va mettre à jour

            $this->updateMetadata($datastoreId, $datasheetName, $apiMetadata, $formData);
        }
    }

    /**
     * @param array<mixed> $formData
     */
    private function createMetadata(string $datastoreId, string $datasheetName, array $formData): void
    {
        $metadataEndpoint = $this->getMetadataEndpoint($datastoreId);

        $newCswMetadata = $this->getNewCswMetadata($datastoreId, $datasheetName, null, $formData);

        // Ajout de l'etiquette si elle n'existe pas deja
        $thumbnailUrl = $this->getThumbnailUrl($datastoreId, $datasheetName);
        if (!is_null($thumbnailUrl)) {
            $newCswMetadata->thumbnailUrl = $thumbnailUrl;
        }

        $newMetadataFilePath = $this->cswMetadataHelper->saveToFile($newCswMetadata);

        $newApiMetadata = $this->metadataApiService->add($datastoreId, $newMetadataFilePath);
        $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], [
            CommonTags::DATASHEET_NAME => $datasheetName,
        ]);

        $this->metadataApiService->publish($datastoreId, $newCswMetadata->fileIdentifier, $metadataEndpoint['_id']);
    }

    /**
     * @param array<mixed> $oldApiMetadata
     * @param array<mixed> $formData
     */
    private function updateMetadata(string $datastoreId, string $datasheetName, array $oldApiMetadata, ?array $formData = null): void
    {
        $metadataEndpoint = $this->getMetadataEndpoint($datastoreId);

        $oldMetadataFileXml = $this->metadataApiService->downloadFile($datastoreId, $oldApiMetadata['_id']);
        $oldCswMetadata = $this->cswMetadataHelper->fromXml($oldMetadataFileXml);

        $newCswMetadata = $this->getNewCswMetadata($datastoreId, $datasheetName, $oldCswMetadata, $formData);

        // Mise a jour de l'etiquette
        $thumbnailUrl = $this->getThumbnailUrl($datastoreId, $datasheetName);
        if ($newCswMetadata->thumbnailUrl !== $thumbnailUrl) {
            $newCswMetadata->thumbnailUrl = $thumbnailUrl;
        }

        $newMetadataFilePath = $this->cswMetadataHelper->saveToFile($newCswMetadata);

        // suppression et recréation de métadonnées si changement de file_identifier
        if ($oldCswMetadata->fileIdentifier !== $newCswMetadata->fileIdentifier) {
            $this->metadataApiService->unpublish($datastoreId, $oldCswMetadata->fileIdentifier, $metadataEndpoint['_id']);
            $this->metadataApiService->delete($datastoreId, $oldApiMetadata['_id']);

            $newApiMetadata = $this->metadataApiService->add($datastoreId, $newMetadataFilePath);
        } else {
            $newApiMetadata = $this->metadataApiService->replaceFile($datastoreId, $oldApiMetadata['_id'], $newMetadataFilePath);
        }
        $newApiMetadata = $this->metadataApiService->addTags($datastoreId, $newApiMetadata['_id'], $oldApiMetadata['tags']);

        if (0 === count($newApiMetadata['endpoints'])) { // la métadonnée n'est pas déjà publiée
            $this->metadataApiService->publish($datastoreId, $newCswMetadata->fileIdentifier, $metadataEndpoint['_id']);
        }
    }

    /**
     * Construit l'objet metadata du catalogue pour une création ou modification. Si création, $formData est obligatoire. Si modification, $oldCswMetadata est obligatoire mais $formData est optionnel.
     *
     * @param ?array<mixed> $formData
     */
    private function getNewCswMetadata(string $datastoreId, string $datasheetName, ?CswMetadata $oldCswMetadata = null, ?array $formData = null): CswMetadata
    {
        if (null === $oldCswMetadata && null === $formData) {
            throw new AppException('oldCswMetadata et formData ne peuvent pas être null à la fois', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $newCswMetadata = null === $oldCswMetadata ? CswMetadata::createEmpty() : clone $oldCswMetadata;

        $layers = $this->getMetadataLayers($datastoreId, $datasheetName);

        if ($formData) {
            $language = $formData['languages'][0] ?
                 new CswLanguage($formData['languages'][0]['code'], $formData['languages'][0]['language'])
                 : CswLanguage::default();

            $newCswMetadata->fileIdentifier = $formData['identifier'];
            $newCswMetadata->hierarchyLevel = CswHierarchyLevel::tryFrom('' === $formData['resource_genealogy'] ? 'series' : $formData['resource_genealogy']);

            $newCswMetadata->language = $language;
            $newCswMetadata->charset = $formData['charset'];
            $newCswMetadata->title = $formData['public_name'];
            $newCswMetadata->abstract = $formData['description'];
            $newCswMetadata->creationDate = $formData['creation_date'];
            $newCswMetadata->topicCategories = $formData['category'];
            $newCswMetadata->inspireKeywords = $formData['keywords'];
            $newCswMetadata->freeKeywords = $formData['free_keywords'];
            $newCswMetadata->contactEmail = $formData['email_contact'];
            $newCswMetadata->organisationName = $formData['organization'];
            $newCswMetadata->organisationEmail = $formData['organization_email'];
            $newCswMetadata->resolution = $formData['resolution'];
            $newCswMetadata->frequencyCode = $formData['frequency_code'];
            $newCswMetadata->layers = $layers;
        }

        return $newCswMetadata;
    }

    /**
     * @return array<CswMetadataLayer>
     */
    private function getMetadataLayers(string $datastoreId, string $datasheetName): array
    {
        $configurationsList = $this->configurationApiService->getAllDetailed($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ]);

        $layers = [];

        foreach ($configurationsList as $configuration) {
            $configurationOfferings = $this->configurationApiService->getConfigurationOfferings($datastoreId, $configuration['_id']);

            if (count($configurationOfferings) > 0) {
                $offering = $configurationOfferings[0];
                $offering = $this->configurationApiService->getOffering($datastoreId, $offering['_id']);

                $serviceEndpoint = $this->datastoreApiService->getEndpoint($datastoreId, $offering['endpoint']['_id']);

                switch ($configuration['type']) {
                    case ConfigurationTypes::WFS:
                        $subLayers = $this->getWfsSubLayers($configuration, $offering, $serviceEndpoint['endpoint']['urls'][0]['url']);
                        $layers = array_merge($layers, $subLayers);

                        break;

                    case ConfigurationTypes::WMSVECTOR:
                        $layerName = $offering['layer_name'];
                        $endpointType = 'OGC:WMS';
                        $getCapUrl = $this->capabilitiesService->getGetCapUrl($serviceEndpoint['endpoint']['urls'][0]['url'], $offering['urls'][0]['url'], 'WMS');

                        $layers[] = new CswMetadataLayer($layerName, $endpointType, $getCapUrl, $offering['_id']);
                        break;

                    case ConfigurationTypes::WMTSTMS:
                        $layerName = $offering['layer_name'];
                        $endpointType = 'OGC:TMS';

                        $tmsEndpoints = array_filter($serviceEndpoint['endpoint']['urls'], fn (array $url) => 'TMS' === $url['type']);
                        $tmsEndpoints = array_values($tmsEndpoints);

                        if (count($tmsEndpoints) > 0) {
                            $layers[] = new CswMetadataLayer($layerName, $endpointType, $tmsEndpoints[0]['url'], $offering['_id']);
                        }

                        break;
                }
            }
        }

        return $layers;
    }

    /**
     * @param array<mixed> $configuration
     * @param array<mixed> $offering
     *
     * @return array<CswMetadataLayer>
     */
    private function getWfsSubLayers(array $configuration, array $offering, string $serviceEndpointUrl): array
    {
        $configRelations = $configuration['type_infos']['used_data'][0]['relations'];

        $relationLayers = array_map(function ($relation) use ($offering, $serviceEndpointUrl) {
            $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['native_name']);
            $endpointType = 'OGC:WFS';
            $getCapUrl = $this->capabilitiesService->getGetCapUrl($serviceEndpointUrl, $offering['urls'][0]['url'], 'WFS');

            return new CswMetadataLayer($layerName, $endpointType, $getCapUrl, $offering['_id']);
        }, $configRelations);

        return $relationLayers;
    }

    private function getMetadataEndpoint(string $datastoreId): array
    {
        $endpointsList = $this->datastoreApiService->getEndpointsList($datastoreId, [
            'type' => 'METADATA',
            'open' => true,
        ]);
        if (0 === count($endpointsList)) {
            throw new CartesApiException("Point d'accès (endpoint) métadonnées n'a pas été trouvé");
        }

        return $endpointsList[0]['endpoint'];
    }
}
