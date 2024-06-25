<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StaticFileTypes;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\StaticApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Uid\Uuid;

#[Route(
    '/api/datastores/{datastoreId}/stored_data/{storedDataId}/wmsvector',
    name: 'cartesgouvfr_api_wmsvector_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class WmsVectorController extends ServiceController implements ApiControllerInterface
{
    public function __construct(
        DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private StoredDataApiService $storedDataApiService,
        CartesServiceApiService $cartesServiceApiService,
        private StaticApiService $staticApiService,
        private CapabilitiesService $capabilitiesService,
        protected Filesystem $filesystem,
        private CartesMetadataApiService $cartesMetadataApiService,
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApiService, $capabilitiesService, $cartesMetadataApiService);
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(
        string $datastoreId,
        string $storedDataId,
        // #[MapRequestPayload] WmsVectorAddDTO $dto, // TODO : MapRequestPayload ne marche pas avec FormData (envoyé par js), essayer de trouver une solution
        Request $request
    ): JsonResponse {
        $data = $request->request->all();
        $files = $request->files->all(); // les fichiers de style .sld

        $tablesNamesList = isset($data['selected_tables']) ? json_decode($data['selected_tables'], true) : [];

        try {
            // ajout ou mise à jour des fichiers de styles SLD
            $styleFilesByTable = $this->sendStyleFiles($datastoreId, $tablesNamesList, $files);

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($data, $tablesNamesList, $styleFilesByTable, $storedDataId);

            $storedData = $this->storedDataApiService->get($datastoreId, $storedDataId);
            $datasheetName = $storedData['tags'][CommonTags::DATASHEET_NAME];

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMSVECTOR, $data['share_with']);

            // Ajout de la configuration
            $configuration = $this->configurationApiService->add($datastoreId, $configRequestBody);
            $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], [
                CommonTags::DATASHEET_NAME => $storedData['tags'][CommonTags::DATASHEET_NAME],
            ]);

            // remplace nom temporaire des fichiers statiques
            foreach ($styleFilesByTable as $tableName => $staticFileId) {
                $this->staticApiService->modifyInfo($datastoreId, $staticFileId, [
                    'name' => sprintf('config_%s_style_wmsv_%s', $configuration['_id'], $tableName),
                ]);
            }

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
            if ('your_community' === $data['share_with']) {
                $this->addPermissionForCurrentCommunity($datastoreId, $offering);
            }

            // création ou mise à jour de metadata
            $data['languages'] = json_decode($data['languages'], true);
            $data['category'] = json_decode($data['category'], true);
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $data);

            // Création ou mise à jour du capabilities
            try {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            } catch (\Exception $e) {
            }

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
        Request $request
    ): JsonResponse {
        $data = $request->request->all();
        $files = $request->files->all(); // les fichiers de style .sld

        $tablesNamesList = isset($data['selected_tables']) ? json_decode($data['selected_tables'], true) : [];

        try {
            // récup config et offering existants
            $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id']);
            $datasheetName = $oldConfiguration['tags'][CommonTags::DATASHEET_NAME];

            // ajout ou mise à jour des fichiers de styles SLD
            $styleFilesByTable = $this->sendStyleFiles($datastoreId, $tablesNamesList, $files, $oldConfiguration);

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($data, $tablesNamesList, $styleFilesByTable, $storedDataId, true);

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMSVECTOR, $data['share_with']);

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

            $this->cleanUnusedStyleFiles($datastoreId, $oldConfiguration, $styleFilesByTable);

            // création ou mise à jour de metadata
            $data['languages'] = json_decode($data['languages'], true);
            $data['category'] = json_decode($data['category'], true);
            $data['keywords'] = json_decode($data['keywords'], true);
            $data['free_keywords'] = json_decode($data['free_keywords'], true);
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $data);

            // Création ou mise à jour du capabilities
            try {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            } catch (\Exception $e) {
            }

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed>         $data
     * @param array<string>        $tablesNamesList
     * @param array<string,string> $tables
     *
     * @return array<mixed>
     */
    private function getConfigRequestBody(array $data, array $tablesNamesList, array $tables, string $storedDataId, bool $editMode = false): array
    {
        $relations = [];
        foreach ($tablesNamesList as $tableName) {
            $relations[] = [
                'name' => $tableName,
                'style' => $tables[$tableName],
            ];
        }

        $body = [
            'type' => ConfigurationTypes::WMSVECTOR,
            'name' => $data['public_name'],
            'type_infos' => [
                'title' => $data['public_name'],
                'abstract' => $data['description'],
                'keywords' => json_decode($data['category'], true),
                'used_data' => [
                    [
                        'relations' => $relations,
                        'stored_data' => $storedDataId,
                    ],
                ],
            ],
        ];

        if (false === $editMode) {
            $body['layer_name'] = $data['technical_name'];
        }

        if ('' !== $data['attribution_text'] && '' !== $data['attribution_url']) {
            $body['attribution'] = [
                'title' => $data['attribution_text'],
                'url' => $data['attribution_url'],
            ];
        }

        return $body;
    }

    /**
     * Publie les fichiers de styles SLD en tant que fichiers statiques. Un fichier de style par table. En cas de succès, retourne un tableau avec le nom des tables avec l'ID du fichier statique correspondant.
     *
     * @param array<string>       $tablesNamesList
     * @param array<UploadedFile> $files
     * @param ?array<mixed>       $oldConfiguration uniquement en mode édition
     *
     * @return array<string,string>
     */
    private function sendStyleFiles(string $datastoreId, array $tablesNamesList, array $files, ?array $oldConfiguration = null): array
    {
        $directory = $this->getParameter('style_files_path');

        /** @var array<string,string> nom table, identifiant fichier statique */
        $styleFilesByTable = [];

        // création d'une nouvelle publication
        if (null === $oldConfiguration) {
            // uuid temporaire qui sera remplacé par l'id de la config une fois créée
            $tmpConfigUuid = Uuid::v4();

            foreach ($tablesNamesList as $tableName) {
                $styleFileName = sprintf('config_%s_style_wmsv_%s', "tmp_{$tmpConfigUuid}", $tableName);

                /** @var UploadedFile|null */
                $file = $files["style_{$tableName}"] ?? null;
                $tmpFileDir = $directory.'/'.Uuid::v4();

                $file->move($tmpFileDir, $file->getClientOriginalName());

                $staticStyleFile = $this->staticApiService->add($datastoreId, $tmpFileDir.'/'.$file->getClientOriginalName(), $styleFileName, StaticFileTypes::GEOSERVER_STYLE);
                $styleFilesByTable[$tableName] = $staticStyleFile['_id'];
            }
        }
        // modification d'une publication existante
        else {
            // récup tous les fichiers statiques liés à la configuration
            $relations = $oldConfiguration['type_infos']['used_data'][0]['relations'];
            $oldStyleFilesByTable = [];

            foreach ($relations as $relation) {
                $oldStyleFilesByTable[$relation['name']] = $relation['style'];
            }

            foreach ($tablesNamesList as $tableName) {
                /** @var UploadedFile|null */
                $file = $files["style_{$tableName}"] ?? null;
                $tmpFileDir = $directory.'/'.Uuid::v4();

                // si un nouveau fichier est fourni pour une table existante de la configuration, on remplace le fichier, sinon on publie un nouveau fichier statique
                if (null !== $file) {
                    $file->move($tmpFileDir, $file->getClientOriginalName());

                    if (isset($oldStyleFilesByTable[$tableName])) {
                        $staticStyleFile = $this->staticApiService->replaceFile($datastoreId, $oldStyleFilesByTable[$tableName], $tmpFileDir.'/'.$file->getClientOriginalName());
                    } else {
                        $styleFileName = sprintf('config_%s_style_wmsv_%s', $oldConfiguration['_id'], $tableName);

                        $staticStyleFile = $this->staticApiService->add($datastoreId, $tmpFileDir.'/'.$file->getClientOriginalName(), $styleFileName, StaticFileTypes::GEOSERVER_STYLE);
                    }
                    $styleFilesByTable[$tableName] = $staticStyleFile['_id'];
                } else {
                    $styleFilesByTable[$tableName] = $oldStyleFilesByTable[$tableName];
                }
            }
        }

        return $styleFilesByTable;
    }

    /**
     * @param array<mixed>         $oldConfiguration
     * @param array<string,string> $styleFilesByTable
     */
    private function cleanUnusedStyleFiles(string $datastoreId, array $oldConfiguration, array $styleFilesByTable): void
    {
        $relations = $oldConfiguration['type_infos']['used_data'][0]['relations'];
        $oldStyleFilesByTable = [];

        foreach ($relations as $relation) {
            $oldStyleFilesByTable[$relation['name']] = $relation['style'];
        }

        // suppr des fichiers statiques existant qui ne sont plus utilisés après la mise à jour
        foreach ($oldStyleFilesByTable as $tableName => $staticFileId) {
            if (!array_key_exists($tableName, $styleFilesByTable)) {
                $this->staticApiService->delete($datastoreId, $staticFileId);
            }
        }
    }
}
