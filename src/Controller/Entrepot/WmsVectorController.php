<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\Sandbox;
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
use App\Services\EntrepotApi\StoredDataApiService;
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
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private StoredDataApiService $storedDataApiService,
        CartesServiceApiService $cartesServiceApiService,
        private StaticApiService $staticApiService,
        private CapabilitiesService $capabilitiesService,
        protected Filesystem $filesystem,
        private CartesMetadataApiService $cartesMetadataApiService,
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
            $configRequestBody = $this->getConfigRequestBody($dto, $tablesNamesList, $styleFilesByTable, $storedDataId, false, $datastoreId);

            $storedData = $this->storedDataApiService->get($datastoreId, $storedDataId);
            $datasheetName = $storedData['tags'][CommonTags::DATASHEET_NAME];

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMSVECTOR, $dto->share_with);

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
            if ('your_community' === $dto->share_with) {
                $this->addPermissionForCurrentCommunity($datastoreId, $offering);
            }

            // création d'une permission pour la communauté config
            if (true === filter_var($dto->allow_view_data, FILTER_VALIDATE_BOOLEAN)) {
                $communityId = $this->getParameter('config')['community_id'];
                $this->addPermissionForCommunity($datastoreId, $communityId, $offering);
            }

            // Création ou mise à jour du capabilities
            try {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            } catch (\Exception $e) {
            }

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $formData['identifier'] = Sandbox::LAYERNAME_PREFIX.$formData['identifier'];
            }
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $formData);

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
            $datasheetName = $oldConfiguration['tags'][CommonTags::DATASHEET_NAME];

            // ajout ou mise à jour des fichiers de styles SLD
            $styleFilesByTable = $this->sendStyleFiles($datastoreId, $tablesNamesList, $files, $oldConfiguration);

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $tablesNamesList, $styleFilesByTable, $storedDataId, true);

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WMSVECTOR, $dto->share_with);

            // Mise à jour de la configuration
            $configuration = $this->configurationApiService->replace($datastoreId, $oldConfiguration['_id'], $configRequestBody);

            // on recrée l'offering si changement d'endpoint, sinon demande la synchronisation
            if ($oldOffering['open'] !== $endpoint['open']) {
                $this->configurationApiService->removeOffering($datastoreId, $oldOffering['_id']);

                $offering = $this->configurationApiService->addOffering($datastoreId, $oldConfiguration['_id'], $endpoint['_id'], $endpoint['open']);
            } else {
                $offering = $this->configurationApiService->syncOffering($datastoreId, $offeringId);
            }

            if (false === $offering['open']) {
                // création d'une permission pour la communauté config
                if (true === filter_var($dto->allow_view_data, FILTER_VALIDATE_BOOLEAN)) {
                    $communityId = $this->getParameter('config')['community_id'];
                    $this->addPermissionForCommunity($datastoreId, $communityId, $offering);
                } else {
                    $communityId = $this->getParameter('config')['community_id'];
                    $permissions = $this->datastoreApiService->getPermissions($datastoreId);

                    $targetPermission = array_filter($permissions, function ($permission) use ($offering, $communityId) {
                        return isset($permission['offerings'])
                            && in_array($offering['_id'], array_column($permission['offerings'], '_id'))
                            && isset($permission['beneficiary']['_id'])
                            && $permission['beneficiary']['_id'] === $communityId;
                    });

                    if (!empty($targetPermission)) {
                        $permissionId = reset($targetPermission)['_id'];
                        $this->datastoreApiService->removePermission($datastoreId, $permissionId);
                    }
                }
                // création d'une permission pour la communauté actuelle
                $this->addPermissionForCurrentCommunity($datastoreId, $offering);
            }

            $offering['configuration'] = $configuration;

            // Création ou mise à jour du capabilities
            try {
                $this->capabilitiesService->createOrUpdate($datastoreId, $endpoint, $offering['urls'][0]['url']);
            } catch (\Exception $e) {
            }

            $this->cleanUnusedStyleFiles($datastoreId, $oldConfiguration, $styleFilesByTable);

            // création ou mise à jour de metadata
            $formData = json_decode(json_encode($dto), true);
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $formData['identifier'] = Sandbox::LAYERNAME_PREFIX.$formData['identifier'];
            }
            $this->cartesMetadataApiService->createOrUpdate($datastoreId, $datasheetName, $formData);

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
    private function getConfigRequestBody(WmsVectorServiceDTO $dto, array $tablesNamesList, array $tables, string $storedDataId, bool $editMode = false, ?string $datastoreId = null): array
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
            'name' => $dto->service_name,
            'type_infos' => [
                'title' => $dto->service_name,
                'abstract' => $dto->description,
                'keywords' => $dto->category,
                'used_data' => [
                    [
                        'relations' => $relations,
                        'stored_data' => $storedDataId,
                    ],
                ],
            ],
        ];

        if (false === $editMode) {
            $body['layer_name'] = $dto->technical_name;

            // rajoute le préfixe "sandbox." si c'est la communauté bac à sable
            if ($this->sandboxService->isSandboxDatastore($datastoreId)) {
                $body['layer_name'] = Sandbox::LAYERNAME_PREFIX.$body['layer_name'];
            }
        }

        if ('' !== $dto->attribution_text && '' !== $dto->attribution_url) {
            $body['attribution'] = [
                'title' => $dto->attribution_text,
                'url' => $dto->attribution_url,
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
