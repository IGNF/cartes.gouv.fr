<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\StaticFileTypes;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/stored_data/{storedDataId}/wmsvector',
    name: 'cartesgouvfr_api_wmsvector_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class WmsVectorController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService,
        protected Filesystem $filesystem,
    ) {
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
            $tables = $this->sendStyleFiles($datastoreId, $storedDataId, $tablesNamesList, $files);

            // // création de configuration
            $relations = [];

            foreach ($tablesNamesList as $tableName) {
                $relations[] = [
                    'name' => $tableName,
                    'style' => $tables[$tableName],
                ];
            }

            $body = [
                'type' => 'WMS-VECTOR',
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

            $storedData = $this->entrepotApiService->storedData->get($datastoreId, $storedDataId);
            $endpoints = [];
            $isOfferingOpen = true;

            // TODO : implémentation partielle, tous les partages ne sont pas couverts
            if ('all_public' === $data['share_with']) {
                $endpoints = $this->entrepotApiService->datastore->getEndpointsList($datastoreId, [
                    'type' => 'WMS-VECTOR',
                    'open' => true,
                ]);
                $isOfferingOpen = true;
            } elseif ('your_community' === $data['share_with']) {
                $endpoints = $this->entrepotApiService->datastore->getEndpointsList($datastoreId, [
                    'type' => 'WMS-VECTOR',
                    'open' => false,
                ]);
                $isOfferingOpen = false;
            } else {
                throw new CartesApiException('Valeur du champ [share_with] est invalide', Response::HTTP_BAD_REQUEST, ['share_with' => $data['share_with']]);
            }

            if (0 === count($endpoints)) {
                throw new CartesApiException("Aucun point d'accès (endpoint) du datastore ne peut convenir à la demande", Response::HTTP_BAD_REQUEST, ['share_with' => $data['share_with']]);
            }

            $endpointId = $endpoints[0]['endpoint']['_id'];

            // Ajout de la configuration
            $configuration = $this->entrepotApiService->configuration->add($datastoreId, $body);
            $configuration = $this->entrepotApiService->configuration->addTags($datastoreId, $configuration['_id'], [
                CommonTags::DATASHEET_NAME => $storedData['tags'][CommonTags::DATASHEET_NAME],
            ]);

            // Creation d'une offering
            $offering = $this->entrepotApiService->configuration->addOffering($datastoreId, $configuration['_id'], $endpointId, $isOfferingOpen);

            return $this->json([
                'configuration' => $configuration,
                'offering' => $offering,
            ]);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * Publie les fichiers de styles SLD en tant que fichiers statiques. Un fichier de style par table. En cas de succès, retourne un tableau avec le nom des tables avec l'ID du fichier statique correspondant.
     *
     * @param array<string>       $tablesNamesList
     * @param array<UploadedFile> $files
     *
     * @return array<string,string>
     */
    public function sendStyleFiles(string $datastoreId, string $storedDataId, array $tablesNamesList, array $files): array
    {
        /** @var array<string,string> nom table, identifiant fichier statique */
        $tables = [];

        // récup tous les fichiers statiques liés à la stored_data
        $staticFiles = $this->entrepotApiService->static->getAll($datastoreId, [
            'type' => StaticFileTypes::GEOSERVER_STYLE,
            'name' => sprintf('storeddata_%s_style_wmsv_%%', $storedDataId),
        ]);

        foreach ($tablesNamesList as $tableName) {
            /** @var UploadedFile */
            $file = $files["style_{$tableName}"];

            $styleFileName = sprintf('storeddata_%s_style_wmsv_%s', $storedDataId, $tableName);

            $filteredStyles = array_filter($staticFiles, function ($style) use ($styleFileName) {
                return $style['name'] === $styleFileName;
            });
            $filteredStyles = array_values($filteredStyles);

            $directory = $this->getParameter('style_files_path');
            $file->move($directory, $file->getClientOriginalName());

            // aucun fichier de style n'existe pas pour la combo de $storedDataId, 'wmsv' et $tableName
            if (0 === count($filteredStyles)) {
                $staticStyleFile = $this->entrepotApiService->static->add($datastoreId, $directory.'/'.$file->getClientOriginalName(), $styleFileName, StaticFileTypes::GEOSERVER_STYLE);
            }
            // un fichier de style existe déjà
            else {
                $staticStyleFile = $filteredStyles[0];
                $staticStyleFile = $this->entrepotApiService->static->replaceFile($datastoreId, $staticStyleFile['_id'], $directory.'/'.$file->getClientOriginalName());
            }

            $tables[$tableName] = $staticStyleFile['_id'];
        }

        return $tables;
    }
}
