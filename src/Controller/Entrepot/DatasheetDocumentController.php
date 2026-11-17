<?php

declare(strict_types=1);

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Dto\Datasheet\DatasheetDocumentDTO;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Validator\Constraint\DatasheetDocumentFile;
use OpenApi\Attributes as OA;
use Psr\Clock\ClockInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Attribute\MapUploadedFile;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\AsciiSlugger;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Exception\ValidationFailedException;

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
        private readonly ClockInterface $clock,
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

        return $this->json($this->readList($datastoreId, $listAnnexe));
    }

    // multipart : champs du DTO et, pour un fichier, le fichier `file`
    #[Route('', name: 'add', methods: ['POST'])]
    public function add(
        string $datastoreId,
        string $datasheetName,
        #[MapRequestPayload(validationGroups: ['Default', DatasheetDocumentDTO::CREATION])] DatasheetDocumentDTO $dto,
        #[MapUploadedFile(constraints: new DatasheetDocumentFile())] ?UploadedFile $file = null,
    ): JsonResponse {
        if (DatasheetDocumentDTO::TYPE_FILE === $dto->type && !$file instanceof UploadedFile) {
            $this->throwViolation($dto, 'file', 'Le fichier est obligatoire');
        }

        /** @var array<mixed> $listAnnexe entité annexe de l'API entrepôt */
        $listAnnexe = $this->findListAnnexe($datastoreId, $datasheetName) ?? $this->createListAnnexe($datastoreId, $datasheetName);
        $documentsList = $this->readList($datastoreId, $listAnnexe);

        // date d’ajout écrite par cartes.gouv.fr ; un remplacement de fichier la garde
        $newDocument = ['type' => $dto->type, 'name' => trim($dto->name), 'creation' => $this->clock->now()->format(\DATE_ATOM)];
        $fileAnnexeId = null;

        // le type décide : un fichier joint à un lien est ignoré
        if (DatasheetDocumentDTO::TYPE_FILE === $dto->type) {
            ['id' => $fileAnnexeId, 'url' => $newDocument['url'], 'file_name' => $newDocument['file_name']] = $this->uploadFile($datastoreId, $datasheetName, $file);
            $newDocument['id'] = $fileAnnexeId;
        } else {
            $newDocument['id'] = (string) Uuid::v4();
            $newDocument['url'] = $dto->url;
        }

        $documentsList[] = $newDocument;

        try {
            $this->updateListAnnexe($datastoreId, $listAnnexe, $documentsList);
        } catch (\Throwable $e) {
            // fichier déposé mais absent de la liste : on le retire, sans masquer l’erreur d’origine
            if (null !== $fileAnnexeId) {
                $this->removeFileAnnexe($datastoreId, $fileAnnexeId);
            }
            throw $e;
        }

        $this->updateMetadataDocuments($datastoreId, $datasheetName, $documentsList);

        return $this->json($documentsList);
    }

    // multipart, comme l’ajout : nom, URL d’un lien, fichier de remplacement ; la description des anciens documents disparaît
    #[Route('/{documentId}', name: 'edit', methods: ['POST'])]
    public function edit(
        string $datastoreId,
        string $datasheetName,
        string $documentId,
        #[MapRequestPayload] DatasheetDocumentDTO $dto,
        #[MapUploadedFile(constraints: new DatasheetDocumentFile())] ?UploadedFile $file = null,
    ): JsonResponse {
        $listAnnexe = $this->findListAnnexe($datastoreId, $datasheetName) ?? throw new AppException('Document introuvable', Response::HTTP_NOT_FOUND);
        $documentsList = $this->readList($datastoreId, $listAnnexe);
        $index = array_search($documentId, array_column($documentsList, 'id'), true);
        if (false === $index) {
            throw new AppException('Document introuvable', Response::HTTP_NOT_FOUND);
        }

        $document = $documentsList[$index];
        if (null !== $dto->url && DatasheetDocumentDTO::TYPE_LINK !== $document['type']) {
            $this->throwViolation($dto, 'url', 'Seul un lien a une URL modifiable');
        }
        if ($file instanceof UploadedFile && DatasheetDocumentDTO::TYPE_FILE !== $document['type']) {
            $this->throwViolation($dto, 'file', 'Seul un document fichier peut être remplacé');
        }

        $document['name'] = trim($dto->name);
        unset($document['description']);
        if (null !== $dto->url) {
            $document['url'] = $dto->url;
        }

        // nouvelle annexe : l’Entrepôt garde le chemin, donc le nom de fichier, d’une annexe remplacée
        $newFileAnnexeId = null;
        if ($file instanceof UploadedFile) {
            ['id' => $newFileAnnexeId, 'url' => $document['url'], 'file_name' => $document['file_name']] = $this->uploadFile($datastoreId, $datasheetName, $file);
            $document['id'] = $newFileAnnexeId;
        }
        $documentsList[$index] = $document;

        try {
            $this->updateListAnnexe($datastoreId, $listAnnexe, $documentsList);
        } catch (\Throwable $e) {
            if (null !== $newFileAnnexeId) {
                $this->removeFileAnnexe($datastoreId, $newFileAnnexeId);
            }
            throw $e;
        }

        if (null !== $newFileAnnexeId) {
            $this->removeFileAnnexe($datastoreId, $documentId);
        }

        $this->updateMetadataDocuments($datastoreId, $datasheetName, $documentsList);

        return $this->json($documentsList);
    }

    #[Route('/{documentId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $datasheetName, string $documentId): JsonResponse
    {
        $listAnnexe = $this->findListAnnexe($datastoreId, $datasheetName) ?? throw new AppException('Document introuvable', Response::HTTP_NOT_FOUND);

        $initialDocumentsList = $this->readList($datastoreId, $listAnnexe);

        // document à supprimer
        $document = null;
        $tempDocumentsList = array_filter($initialDocumentsList, fn ($doc) => $doc['id'] === $documentId);
        $tempDocumentsList = array_values($tempDocumentsList);

        if (isset($tempDocumentsList[0])) {
            $document = $tempDocumentsList[0];
        }

        $newDocumentsList = array_values(array_filter($initialDocumentsList, fn ($doc) => $doc['id'] !== $documentId));

        // la liste d’abord : un échec laisse le document entier, une nouvelle tentative reste possible
        if (null !== $document) {
            $this->updateListAnnexe($datastoreId, $listAnnexe, $newDocumentsList);

            if ('file' === $document['type']) {
                $this->removeFileAnnexe($datastoreId, $document['id']);
            }
        }

        $this->updateMetadataDocuments($datastoreId, $datasheetName, $newDocumentsList);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    // même forme de 422 que les contraintes du DTO
    private function throwViolation(DatasheetDocumentDTO $dto, string $path, string $message): never
    {
        $violations = new ConstraintViolationList([new ConstraintViolation($message, null, [], $dto, $path, null)]);
        throw new UnprocessableEntityHttpException('Validation Failed', new ValidationFailedException($dto, $violations));
    }

    /**
     * @return array{id: string, url: string, file_name: string}
     */
    private function uploadFile(string $datastoreId, string $datasheetName, UploadedFile $file): array
    {
        $uuid = (string) Uuid::v4();
        $fileName = $file->getClientOriginalName();
        $tempFileDir = implode(DIRECTORY_SEPARATOR, [$this->varDataPath, $uuid]);
        $file->move($tempFileDir, $fileName);

        // chemin normalisé : ni virgule (séparateur du champ `paths`), ni caractère à encoder dans l’URL publique
        $slugger = new AsciiSlugger();
        $extension = strtolower($file->getClientOriginalExtension());
        $datasheetSlug = $slugger->slug($datasheetName)->lower()->toString() ?: 'fiche';
        $fileSlug = $slugger->slug(pathinfo($fileName, PATHINFO_FILENAME))->lower()->toString() ?: 'document';
        $annexePath = implode('/', ['documents', $datasheetSlug, $uuid, "$fileSlug.$extension"]);

        try {
            $annexesBaseUrl = $this->annexeApiService->getBaseUrl($datastoreId);
            $fileAnnexe = $this->annexeApiService->add($datastoreId, $tempFileDir.DIRECTORY_SEPARATOR.$fileName, [$annexePath], ["datasheet_name=$datasheetName", 'type=document'], true);
        } finally {
            $this->fs->remove($tempFileDir);
        }

        // nom d’origine gardé pour le téléchargement : le chemin n’en garde qu’une forme normalisée
        return ['id' => $fileAnnexe['_id'], 'url' => $annexesBaseUrl.$fileAnnexe['paths'][0], 'file_name' => $fileName];
    }

    // appelée quand la liste ne référence pas ou plus l’annexe : un échec laisse seulement une annexe orpheline
    private function removeFileAnnexe(string $datastoreId, string $annexeId): void
    {
        try {
            $this->annexeApiService->remove($datastoreId, $annexeId)->await();
        } catch (\Throwable $e) {
            $this->logger->warning('Annexe {annexeId} non supprimée : {error}', ['annexeId' => $annexeId, 'error' => $e->getMessage(), 'exception' => $e]);
        }
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

        // shortcut: chemin non normalisé, pour rester celui des listes existantes ; une virgule dans le nom de la fiche le coupe en deux dans `paths`, à reprendre si une telle fiche apparaît
        $created = $this->annexeApiService->add($datastoreId, $tempFilePath, ["documents/$datasheetName.json"], $this->listAnnexeLabels($datasheetName), true);

        // deux premiers ajouts simultanés : la plus ancienne liste gagne, l’autre requête retire la sienne
        $oldest = $this->findListAnnexe($datastoreId, $datasheetName) ?? $created;
        if ($oldest['_id'] !== $created['_id']) {
            $this->removeFileAnnexe($datastoreId, $created['_id']);
        }

        return $oldest;
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
     *
     * @return list<array<string, mixed>>
     */
    private function readList(string $datastoreId, array $listAnnexe): array
    {
        $list = json_decode($this->annexeApiService->download($datastoreId, $listAnnexe['_id'])->text(), true, flags: JSON_THROW_ON_ERROR);

        return is_array($list) ? array_values($list) : [];
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
