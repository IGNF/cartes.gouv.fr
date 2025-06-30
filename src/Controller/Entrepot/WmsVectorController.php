<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\StaticFileTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\WmsVector\WmsVectorServiceDTO;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\StaticApiService;
use App\Services\SandboxService;
use OpenApi\Attributes as OA;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route(
    '/api/datastores/{datastoreId}/stored_data/{storedDataId}/wmsvector',
    name: 'cartesgouvfr_api_wmsvector_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[cartes.gouv.fr] WMS-VECTOR', description: 'Création/modification des services WMS-VECTOR')]
class WmsVectorController extends ServiceController implements ApiControllerInterface
{
    public function __construct(
        DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private CartesServiceApiService $cartesServiceApiService,
        private StaticApiService $staticApiService,
        CapabilitiesService $capabilitiesService,
        protected Filesystem $filesystem,
        CartesMetadataApiService $cartesMetadataApiService,
        SandboxService $sandboxService,
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApiService, $capabilitiesService, $cartesMetadataApiService, $sandboxService);
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(
        string $datastoreId,
        string $storedDataId,
        #[MapRequestPayload] WmsVectorServiceDTO $dto,
        Request $request,
    ): JsonResponse {
        $files = $request->files->all(); // les fichiers de style .sld

        $tablesNamesList = $dto->selected_tables ?? [];

        try {
            // ajout ou mise à jour des fichiers de styles SLD
            $styleFilesByTable = $this->sendStyleFiles($datastoreId, $tablesNamesList, $files);

            // création de requête pour la config
            $typeInfos = $this->getConfigTypeInfos($dto, $tablesNamesList, $styleFilesByTable, $storedDataId);
            $configRequestBody = $this->getConfigRequestBody($datastoreId, ConfigurationTypes::WMSVECTOR, $dto, $typeInfos);

            $offering = $this->cartesServiceApiService->saveService($datastoreId, $storedDataId, $dto, ConfigurationTypes::WMSVECTOR, $configRequestBody);
            $configuration = $offering['configuration'];

            // remplace nom temporaire des fichiers statiques
            foreach ($styleFilesByTable as $tableName => $staticFileId) {
                $this->staticApiService->modifyInfo($datastoreId, $staticFileId, [
                    'name' => sprintf('config_%s_style_wmsv_%s', $configuration['_id'], $tableName),
                ]);
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
        Request $request,
        #[MapRequestPayload()] WmsVectorServiceDTO $dto,
    ): JsonResponse {
        $files = $request->files->all(); // les fichiers de style .sld

        $tablesNamesList = $dto->selected_tables ?? [];

        try {
            // récup config et offering existants
            $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id']);
            $oldOffering['configuration'] = $oldConfiguration;

            // ajout ou mise à jour des fichiers de styles SLD
            $styleFilesByTable = $this->sendStyleFiles($datastoreId, $tablesNamesList, $files, $oldConfiguration);

            // création de requête pour la config
            $typeInfos = $this->getConfigTypeInfos($dto, $tablesNamesList, $styleFilesByTable, $storedDataId);
            $configRequestBody = $this->getConfigRequestBody($datastoreId, ConfigurationTypes::WMSVECTOR, $dto, $typeInfos, $oldConfiguration);

            $offering = $this->cartesServiceApiService->saveService($datastoreId, $storedDataId, $dto, ConfigurationTypes::WMSVECTOR, $configRequestBody, $oldOffering);

            $this->cleanUnusedStyleFiles($datastoreId, $oldConfiguration, $styleFilesByTable);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<string>        $tablesNamesList
     * @param array<string,string> $tables
     *
     * @return array<mixed>
     */
    private function getConfigTypeInfos(WmsVectorServiceDTO $dto, array $tablesNamesList, array $tables, string $storedDataId): array
    {
        $relations = [];
        foreach ($tablesNamesList as $tableName) {
            $relations[] = [
                'name' => $tableName,
                'style' => $tables[$tableName],
            ];
        }

        return [
            'title' => $dto->service_name,
            'abstract' => $dto->description,
            'keywords' => [...$dto->category, ...$dto->keywords, ...$dto->free_keywords],
            'used_data' => [
                [
                    'relations' => $relations,
                    'stored_data' => $storedDataId,
                ],
            ],
        ];
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
