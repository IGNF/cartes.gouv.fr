<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use OpenApi\Attributes as OA;
use Psr\Log\LoggerInterface;
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
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] datasheet-document', description: 'Des documents liés à une fiche de données sur cartes.gouv.fr')]
class DatasheetDocumentController extends AbstractController implements ApiControllerInterface
{
    private readonly string $varDataPath;

    public function __construct(
        private readonly AnnexeApiService $annexeApiService,
        private readonly CartesMetadataApiService $cartesMetadataApiService,
        private readonly LoggerInterface $logger,
        private readonly Filesystem $fs,
        ParameterBagInterface $parameters,
    ) {
        $this->varDataPath = $parameters->get('datasheet_documents_path');
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getDocumentList(string $datastoreId, string $datasheetName): JsonResponse
    {
        $listAnnexe = $this->findListAnnexe($datastoreId, $datasheetName);
        if (null === $listAnnexe) {
            return $this->json([]);
        }

        $docsListJson = $this->annexeApiService->download($datastoreId, $listAnnexe['_id'])->text();
        $documentsList = json_decode($docsListJson, true);

        return $this->json($documentsList);
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, string $datasheetName, Request $request): JsonResponse
    {
        $documentType = $request->request->get('type');
        $documentName = $request->request->get('name');
        $documentDescription = $request->request->get('description');

        $files = $request->files;
        $fileAnnexeId = null;

        /** @var array<mixed> $listAnnexe entité annexe de l'API entrepôt */
        $listAnnexe = $this->findListAnnexe($datastoreId, $datasheetName) ?? $this->createListAnnexe($datastoreId, $datasheetName);

        $docsListJson = $this->annexeApiService->download($datastoreId, $listAnnexe['_id'])->text();
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
                /** @var UploadedFile|null */
                $file = $files->get('document');
                $uuid = Uuid::v4();

                if (null !== $file) {
                    $tempFileDir = implode(DIRECTORY_SEPARATOR, [$this->varDataPath, $uuid]);
                    $tempFilePath = implode(DIRECTORY_SEPARATOR, [$tempFileDir, $file->getClientOriginalName()]);

                    $file->move($tempFileDir, $file->getClientOriginalName());
                } else {
                    throw new AppException('Fichier non fourni', Response::HTTP_BAD_REQUEST);
                }

                $annexePath = implode('/', ['documents', $datasheetName, $uuid, $file->getClientOriginalName()]);

                $annexesBaseUrl = $this->annexeApiService->getBaseUrl($datastoreId);
                $fileAnnexe = $this->annexeApiService->add($datastoreId, $tempFilePath, [$annexePath], ["datasheet_name=$datasheetName", 'type=document'], true);

                $fileAnnexeId = $fileAnnexe['_id'];
                $newDocument['id'] = $fileAnnexeId;
                $newDocument['url'] = $annexesBaseUrl.$fileAnnexe['paths'][0];

                break;
        }

        $documentsList[] = $newDocument;

        try {
            $this->updateListAnnexe($datastoreId, $listAnnexe, $documentsList);
        } catch (\Throwable $e) {
            // fichier déposé mais absent de la liste : on le retire
            if (null !== $fileAnnexeId) {
                $this->annexeApiService->remove($datastoreId, $fileAnnexeId)->await();
            }
            throw $e;
        }

        $this->updateMetadataDocuments($datastoreId, $datasheetName, $documentsList);

        return $this->json($documentsList);
    }

    #[Route('/{documentId}', name: 'edit', methods: ['PATCH'])]
    public function edit(string $datastoreId, string $datasheetName, string $documentId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $listAnnexe = $this->findListAnnexe($datastoreId, $datasheetName) ?? throw new AppException('Document introuvable', Response::HTTP_NOT_FOUND);

        $docsListJson = $this->annexeApiService->download($datastoreId, $listAnnexe['_id'])->text();
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

        $this->updateMetadataDocuments($datastoreId, $datasheetName, $documentsList);

        return $this->json($documentsList);
    }

    #[Route('/{documentId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $datasheetName, string $documentId): JsonResponse
    {
        $listAnnexe = $this->findListAnnexe($datastoreId, $datasheetName) ?? throw new AppException('Document introuvable', Response::HTTP_NOT_FOUND);

        $docsListJson = $this->annexeApiService->download($datastoreId, $listAnnexe['_id'])->text();
        $initialDocumentsList = json_decode($docsListJson, true);

        // document à supprimer
        $document = null;
        $tempDocumentsList = array_filter($initialDocumentsList, fn ($doc) => $doc['id'] === $documentId);
        $tempDocumentsList = array_values($tempDocumentsList);

        if (isset($tempDocumentsList[0])) {
            $document = $tempDocumentsList[0];
        }

        $newDocumentsList = array_values(array_filter($initialDocumentsList, fn ($doc) => $doc['id'] !== $documentId));

        if (null !== $document) {
            if ('file' === $document['type']) {
                $this->annexeApiService->remove($datastoreId, $document['id'])->await();
            }

            $this->updateListAnnexe($datastoreId, $listAnnexe, $newDocumentsList);
        }

        $this->updateMetadataDocuments($datastoreId, $datasheetName, $newDocumentsList);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Annexe qui porte la liste des documents, null si la fiche n’en a pas encore.
     *
     * @return array<mixed>|null
     */
    private function findListAnnexe(string $datastoreId, string $datasheetName): ?array
    {
        $annexeList = $this->annexeApiService->getAll($datastoreId, null, null, $this->listAnnexeLabels($datasheetName))->resolve();
        if ([] === $annexeList) {
            return null;
        }

        // doublons créés par l’ancienne course à la création : la plus ancienne fait foi
        usort($annexeList, fn (array $a, array $b) => strcmp((string) ($a['creation'] ?? ''), (string) ($b['creation'] ?? '')));
        if (count($annexeList) > 1) {
            $this->logger->warning('Plusieurs listes de documents pour la fiche {datasheetName} : {ids}', ['datasheetName' => $datasheetName, 'ids' => implode(', ', array_column($annexeList, '_id'))]);
        }

        return $annexeList[0];
    }

    /**
     * Créée seulement à la première écriture : une lecture ne crée rien.
     *
     * @return array<mixed>
     */
    private function createListAnnexe(string $datastoreId, string $datasheetName): array
    {
        $tempFilePath = $this->varDataPath.DIRECTORY_SEPARATOR.Uuid::v4().'.json';
        $this->fs->dumpFile($tempFilePath, json_encode([], JSON_THROW_ON_ERROR));

        return $this->annexeApiService->add($datastoreId, $tempFilePath, ["documents/$datasheetName.json"], $this->listAnnexeLabels($datasheetName), true);
    }

    /**
     * @return list<string>
     */
    private function listAnnexeLabels(string $datasheetName): array
    {
        return ["datasheet_name=$datasheetName", 'type=document-list'];
    }

    /**
     * @param array<mixed> $listAnnexe entité annexe de l'API entrepôt
     * @param array<mixed> $content    contenu du fichier annexe
     */
    private function updateListAnnexe(string $datastoreId, array $listAnnexe, array $content): void
    {
        $json = json_encode($content, JSON_THROW_ON_ERROR);
        $tempFilePath = $this->varDataPath.DIRECTORY_SEPARATOR.Uuid::v4().'.json';
        $this->fs->dumpFile($tempFilePath, $json);

        try {
            $this->annexeApiService->replaceFile($datastoreId, $listAnnexe['_id'], $tempFilePath);
        } catch (ApiException $e) {
            // verrou jamais relâché par l’Entrepôt sur les listes créées en double (constaté le 17/11/2026)
            if (Response::HTTP_CONFLICT === $e->getStatusCode()) {
                throw new AppException('La liste des documents de cette fiche est bloquée. Contactez le support.', Response::HTTP_CONFLICT, previous: $e);
            }
            throw $e;
        }
    }

    /**
     * Le document est déjà enregistré : un échec de mise à jour de la fiche de métadonnées est journalisé, pas renvoyé.
     *
     * @param array<mixed> $documents
     */
    private function updateMetadataDocuments(string $datastoreId, string $datasheetName, array $documents): void
    {
        try {
            $this->cartesMetadataApiService->updateDocuments($datastoreId, $datasheetName, $documents);
        } catch (\Exception $e) {
            $this->logger->error('Mise à jour des documents de la fiche de métadonnées {datasheetName} impossible : {error}', ['datasheetName' => $datasheetName, 'error' => $e->getMessage(), 'exception' => $e]);
        }
    }
}
