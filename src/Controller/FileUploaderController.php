<?php

namespace App\Controller;

use App\Services\FileUploader\Chunk\ChunkMerger;
use App\Services\FileUploader\Chunk\ChunkStorage;
use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Path\UploadPathResolver;
use App\Services\FileUploader\Validation\UploadValidationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/_file_uploader',
    name: 'cartesgouvfr_file_uploader_',
    condition: 'request.isXmlHttpRequest()',
    options: ['expose' => true],
)]
class FileUploaderController extends AbstractController
{
    private const VALID_FILE_EXTENSIONS = ['gpkg'];

    public function __construct(
        private readonly ChunkStorage $chunkStorage,
        private readonly ChunkMerger $chunkMerger,
        private readonly UploadValidationService $uploadValidationService,
        private readonly UploadPathResolver $pathResolver,
    ) {
    }

    #[Route('/upload_chunk', name: 'upload_chunk', methods: ['POST'])]
    public function uploadChunk(Request $request): JsonResponse
    {
        try {
            $uuid = $request->get('uuid');
            $index = $request->get('index');
            $chunk = $request->files->get('chunk');

            if (!is_string($uuid) || '' === trim($uuid)) {
                throw new FileUploaderException('Le paramètre [uuid] est obligatoire', Response::HTTP_BAD_REQUEST);
            }
            if (!is_numeric($index)) {
                throw new FileUploaderException('Le paramètre [index] est obligatoire', Response::HTTP_BAD_REQUEST);
            }
            if (!$chunk) {
                throw new FileUploaderException('Le paramètre [chunk] est obligatoire', Response::HTTP_BAD_REQUEST);
            }

            $size = $this->chunkStorage->storeChunk($uuid, intval($index), $chunk);

            return new JsonResponse(['index' => intval($index), 'numBytes' => $size]);
        } catch (FileUploaderException $e) {
            return new JsonResponse(['msg' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return new JsonResponse(['msg' => $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/upload_complete', name: 'upload_complete', methods: ['POST'])]
    public function uploadComplete(Request $request): JsonResponse
    {
        try {
            $content = json_decode($request->getContent(), true);

            if (!array_key_exists('uuid', $content) || !array_key_exists('originalFilename', $content)) {
                throw new \Exception('Les paramètres [uuid] et [originalFilename] sont obligatoires', Response::HTTP_BAD_REQUEST);
            }

            $uuid = $content['uuid'];
            $originalFilename = $content['originalFilename'];

            $directory = $this->pathResolver->getUploadDirectory($uuid);
            $files = array_filter(scandir($directory), function ($filename) use ($directory) {
                return !is_dir("$directory/$filename");
            });

            // Fusion des fichiers (tri inclus)
            $filepath = $this->chunkMerger->merge($uuid, $originalFilename, $files);

            // Validation du fichier + extraction SRID
            $result = $this->uploadValidationService->validate(
                new FinalizedUpload($uuid, $filepath, $originalFilename),
                self::VALID_FILE_EXTENSIONS
            );

            return new JsonResponse($result->toArray());
        } catch (FileUploaderException $e) {
            return new JsonResponse(['msg' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            $code = $e->getCode();
            $status = (is_int($code) && $code >= 400 && $code <= 599) ? $code : JsonResponse::HTTP_INTERNAL_SERVER_ERROR;

            return new JsonResponse(['msg' => $e->getMessage()], $status);
        }
    }
}
