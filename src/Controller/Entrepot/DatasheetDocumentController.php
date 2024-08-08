<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route(
    '/api/datastores/{datastoreId}/datasheet/{datasheetName}/documents',
    name: 'cartesgouvfr_api_datasheet_document_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class DatasheetDocumentController extends AbstractController implements ApiControllerInterface
{
    private string $varDataPath;
    private string $annexesBaseUrl;

    public function __construct(
        private AnnexeApiService $annexeApiService,
        private DatastoreApiService $datastoreApiService,
        private CartesMetadataApiService $cartesMetadataApiService,
        private Filesystem $fs,
        ParameterBagInterface $parameters,
    ) {
        $this->varDataPath = $parameters->get('datasheet_documents_path');
        $this->annexesBaseUrl = $parameters->get('annexes_url');
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getDocumentList(string $datastoreId, string $datasheetName): JsonResponse
    {
        try {
            $listAnnexe = $this->getListAnnexe($datastoreId, $datasheetName);

            $docsListJson = $this->annexeApiService->download($datastoreId, $listAnnexe['_id']);
            $documentsList = json_decode($docsListJson, true);

            return $this->json($documentsList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, string $datasheetName, Request $request): JsonResponse
    {
        try {
            $documentType = $request->request->get('type');
            $documentName = $request->request->get('name');
            $documentDescription = $request->request->get('description');

            $files = $request->files;

            $datastore = $this->datastoreApiService->get($datastoreId);

            /** @var array<mixed> $listAnnexe entité annexe de l'API entrepôt */
            $listAnnexe = $this->getListAnnexe($datastoreId, $datasheetName);

            $docsListJson = $this->annexeApiService->download($datastoreId, $listAnnexe['_id']);
            $documentsList = json_decode($docsListJson, true);

            $newDocument = [
                'type' => $documentType,
                'name' => $documentName,
            ];

            if (null !== $documentDescription) {
                $newDocument['description'] = $documentDescription;
            }

            switch ($documentType) {
                case 'link':
                    $newDocument['id'] = Uuid::v4();
                    $newDocument['url'] = $request->request->get('document');
                    break;

                case 'file':
                    /** @var UploadedFile */
                    $file = $files->get('document');
                    $uuid = Uuid::v4();

                    if (null !== $file) {
                        $tempFileDir = join(DIRECTORY_SEPARATOR, [$this->varDataPath, $uuid]);
                        $tempFilePath = join(DIRECTORY_SEPARATOR, [$tempFileDir, $file->getClientOriginalName()]);

                        $file->move($tempFileDir, $file->getClientOriginalName());
                    }

                    $annexePath = join('/', ['documents', $datasheetName, $uuid, $file->getClientOriginalName()]);

                    $fileAnnexe = $this->annexeApiService->add($datastoreId, $tempFilePath, [$annexePath], ["datasheet_name=$datasheetName", 'type=document'], true);

                    $newDocument['id'] = $fileAnnexe['_id'];
                    $newDocument['url'] = $this->annexesBaseUrl.'/'.$datastore['technical_name'].$fileAnnexe['paths'][0];

                    break;
            }

            $documentsList[] = $newDocument;

            $this->updateListAnnexe($datastoreId, $listAnnexe, $documentsList);

            try {
                $this->cartesMetadataApiService->updateDocuments($datastoreId, $datasheetName);
            } catch (\Exception $ex) {
            }

            return $this->json($documentsList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{documentId}', name: 'edit', methods: ['PATCH'])]
    public function edit(string $datastoreId, string $datasheetName, string $documentId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            $listAnnexe = $this->getListAnnexe($datastoreId, $datasheetName);

            $docsListJson = $this->annexeApiService->download($datastoreId, $listAnnexe['_id']);
            $documentsList = json_decode($docsListJson, true);

            $documentsList = array_map(function ($document) use ($documentId, $data) {
                if ($document['id'] === $documentId) {
                    $document['name'] = $data['name'];

                    if (null !== $data['description'] && !empty($data['description'])) {
                        $document['description'] = $data['description'];
                    } elseif (!empty($document['description'])) {
                        unset($document['description']);
                    }
                }

                return $document;
            }, $documentsList);
            $documentsList = array_values($documentsList);

            $this->updateListAnnexe($datastoreId, $listAnnexe, $documentsList);

            try {
                $this->cartesMetadataApiService->updateDocuments($datastoreId, $datasheetName);
            } catch (\Exception $ex) {
            }

            return $this->json($documentsList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{documentId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $datasheetName, string $documentId): JsonResponse
    {
        try {
            $listAnnexe = $this->getListAnnexe($datastoreId, $datasheetName);

            $docsListJson = $this->annexeApiService->download($datastoreId, $listAnnexe['_id']);
            $initialDocumentsList = json_decode($docsListJson, true);

            // document à supprimer
            $document = null;
            $tempDocumentsList = array_filter($initialDocumentsList, fn ($doc) => $doc['id'] === $documentId);
            $tempDocumentsList = array_values($tempDocumentsList);

            if (isset($tempDocumentsList[0])) {
                $document = $tempDocumentsList[0];
            }

            if (null !== $document) {
                switch ($document['type']) {
                    case 'file':
                        $this->annexeApiService->remove($datastoreId, $document['id']);
                        break;
                }

                $newDocumentsList = array_filter($initialDocumentsList, fn ($doc) => $doc['id'] !== $documentId);
                $newDocumentsList = array_values($newDocumentsList);

                $this->updateListAnnexe($datastoreId, $listAnnexe, $newDocumentsList);
            }

            try {
                $this->cartesMetadataApiService->updateDocuments($datastoreId, $datasheetName);
            } catch (\Exception $ex) {
            }

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * Retourne l'objet annexe qui décrit la liste des documents.
     */
    private function getListAnnexe(string $datastoreId, string $datasheetName): array
    {
        $labels = ["datasheet_name=$datasheetName", 'type=document-list'];

        $annexeList = $this->annexeApiService->getAll($datastoreId, null, null, $labels);

        // retourne l'annexe s'il existe
        if (count($annexeList) > 0) {
            return $annexeList[0];
        }

        // sinon crée et retourne un annexe vide
        $json = json_encode([]);
        $tempFilePath = $this->varDataPath.DIRECTORY_SEPARATOR.Uuid::v4().'.json';
        $this->fs->dumpFile($tempFilePath, $json);

        $annexePath = "documents/$datasheetName.json";
        $annexe = $this->annexeApiService->add($datastoreId, $tempFilePath, [$annexePath], $labels, true);

        return $annexe;
    }

    /**
     * @param array<mixed> $listAnnexe entité annexe de l'API entrepôt
     * @param array<mixed> $content    contenu du fichier annexe
     */
    private function updateListAnnexe(string $datastoreId, array $listAnnexe, array $content): void
    {
        $json = json_encode($content);
        $tempFilePath = $this->varDataPath.DIRECTORY_SEPARATOR.Uuid::v4().'.json';
        $this->fs->dumpFile($tempFilePath, $json);

        $this->annexeApiService->replaceFile($datastoreId, $listAnnexe['_id'], $tempFilePath);
    }
}
