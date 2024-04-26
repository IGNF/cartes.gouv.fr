<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StaticFileTypes;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CswMetadataHelper;
use App\Services\EntrepotApi\CartesServiceApi;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\MetadataApiService;
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
        private CartesServiceApi $cartesServiceApi,
        private StaticApiService $staticApiService,
        protected Filesystem $filesystem,
        MetadataApiService $metadataApiService,
        CswMetadataHelper $cswMetadataHelper,
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApi, $metadataApiService, $cswMetadataHelper);
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
            $offering = $this->configurationApiService->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
            $offering['configuration'] = $configuration;

            // création ou mise à jour de metadata
            $data['languages'] = json_decode($data['languages'], true);
            $data['category'] = json_decode($data['category'], true);
            $this->createOrUpdateMetadata($data, $datastoreId, $datasheetName);

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
            // récup anciens config et offering
            $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id']);
            $datasheetName = $oldConfiguration['tags'][CommonTags::DATASHEET_NAME];

            // ajout ou mise à jour des fichiers de styles SLD
            $styleFilesByTable = $this->sendStyleFiles($datastoreId, $tablesNamesList, $files, $oldConfiguration);

            // suppression anciens configs et offering
            $this->cartesServiceApi->wmsVectorUnpublish($datastoreId, $oldOffering, false);

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($data, $tablesNamesList, $styleFilesByTable, $storedDataId);

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMSVECTOR, $data['share_with']);

            // Ajout de la configuration
            $configuration = $this->configurationApiService->add($datastoreId, $configRequestBody);
            $configuration = $this->configurationApiService->addTags($datastoreId, $configuration['_id'], $oldConfiguration['tags']);

            // remplace nom temporaire des fichiers statiques
            foreach ($styleFilesByTable as $tableName => $staticFileId) {
                $this->staticApiService->modifyInfo($datastoreId, $staticFileId, [
                    'name' => sprintf('config_%s_style_wmsv_%s', $configuration['_id'], $tableName),
                ]);
            }

            // Creation d'une offering
            $offering = $this->configurationApiService->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
            $offering['configuration'] = $configuration;

            // création ou mise à jour de metadata
            $data['languages'] = json_decode($data['languages'], true);
            $data['category'] = json_decode($data['category'], true);
            $this->createOrUpdateMetadata($data, $datastoreId, $datasheetName);

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
    private function getConfigRequestBody(array $data, array $tablesNamesList, array $tables, string $storedDataId): array
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
            'layer_name' => $data['technical_name'],
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

                $file->move($directory, $file->getClientOriginalName());

                $staticStyleFile = $this->staticApiService->add($datastoreId, $directory.'/'.$file->getClientOriginalName(), $styleFileName, StaticFileTypes::GEOSERVER_STYLE);
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

                // si un nouveau fichier est fourni pour cette table, on remplace le fichier
                if (null !== $file) {
                    $file->move($directory, $file->getClientOriginalName());

                    $staticStyleFile = $this->staticApiService->replaceFile($datastoreId, $oldStyleFilesByTable[$tableName], $directory.'/'.$file->getClientOriginalName());
                }
                $styleFilesByTable[$tableName] = $oldStyleFilesByTable[$tableName];
            }
        }

        return $styleFilesByTable;
    }
}
