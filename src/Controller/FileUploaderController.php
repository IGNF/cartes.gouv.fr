<?php

namespace App\Controller;

use App\Services\FileUploader\Chunk\ChunkMerger;
use App\Services\FileUploader\Chunk\ChunkStorage;
use App\Services\FileUploader\Dto\FinalizedUpload;
use App\Services\FileUploader\Exception\FileUploaderException;
use App\Services\FileUploader\Format\Catalog\SupportedUploadFormatsCatalog;
use App\Services\FileUploader\Path\UploadPathResolver;
use App\Services\FileUploader\Validation\UploadValidationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\UuidV4;

#[Route(
    '/_file_uploader',
    name: 'cartesgouvfr_file_uploader_',
    condition: 'request.isXmlHttpRequest()',
    options: ['expose' => true],
)]
class FileUploaderController extends AbstractController
{
    public function __construct(
        private readonly ChunkStorage $chunkStorage,
        private readonly ChunkMerger $chunkMerger,
        private readonly UploadValidationService $uploadValidationService,
        private readonly UploadPathResolver $pathResolver,
        private readonly SupportedUploadFormatsCatalog $formatsCatalog,
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

            if (!UuidV4::isValid($uuid)) {
                throw new FileUploaderException('Le paramètre [uuid] est invalide', Response::HTTP_BAD_REQUEST);
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

            if (!is_array($content)) {
                throw new FileUploaderException('Corps de requête invalide', Response::HTTP_BAD_REQUEST);
            }

            if (!array_key_exists('uuid', $content) || !array_key_exists('originalFilename', $content)) {
                throw new FileUploaderException('Les paramètres [uuid] et [originalFilename] sont obligatoires', Response::HTTP_BAD_REQUEST);
            }

            $uuid = $content['uuid'];
            $originalFilename = $content['originalFilename'];

            if (!is_string($uuid) || '' === trim($uuid)) {
                throw new FileUploaderException('Le paramètre [uuid] est invalide', Response::HTTP_BAD_REQUEST);
            }

            if (!UuidV4::isValid($uuid)) {
                throw new FileUploaderException('Le paramètre [uuid] est invalide', Response::HTTP_BAD_REQUEST);
            }
            if (!is_string($originalFilename) || '' === trim($originalFilename)) {
                throw new FileUploaderException('Le paramètre [originalFilename] est invalide', Response::HTTP_BAD_REQUEST);
            }

            if (str_contains($originalFilename, "\0") || str_contains($originalFilename, '/') || str_contains($originalFilename, '\\')) {
                throw new FileUploaderException('Le paramètre [originalFilename] est invalide', Response::HTTP_BAD_REQUEST);
            }

            $totalChunks = $content['totalChunks'] ?? null;
            $fileSize = $content['fileSize'] ?? null;

            if (null !== $totalChunks && (!is_numeric($totalChunks) || intval($totalChunks) < 1)) {
                throw new FileUploaderException('Le paramètre [totalChunks] est invalide', Response::HTTP_BAD_REQUEST);
            }
            if (null !== $fileSize && (!is_numeric($fileSize) || intval($fileSize) < 0)) {
                throw new FileUploaderException('Le paramètre [fileSize] est invalide', Response::HTTP_BAD_REQUEST);
            }

            $directory = $this->pathResolver->getUploadDirectory($uuid);

            if (!is_dir($directory)) {
                throw new FileUploaderException('Aucun chunk trouvé pour cet upload', Response::HTTP_BAD_REQUEST);
            }

            $filesOnDisk = array_filter(scandir($directory) ?: [], function (string $filename) use ($directory) {
                return !is_dir("$directory/$filename");
            });

            $files = [];
            if (null !== $totalChunks) {
                $expected = intval($totalChunks);
                $missing = [];

                for ($i = 1; $i <= $expected; ++$i) {
                    $name = sprintf('%s_%d', $uuid, $i);
                    if (!in_array($name, $filesOnDisk, true)) {
                        $missing[] = $i;
                        continue;
                    }
                    $files[] = $name;
                }

                if (!empty($missing)) {
                    $preview = array_slice($missing, 0, 20);
                    $suffix = count($missing) > 20 ? '…' : '';
                    throw new FileUploaderException(sprintf('Des chunks sont manquants (%d/%d): %s%s', count($missing), $expected, implode(', ', $preview), $suffix), Response::HTTP_BAD_REQUEST);
                }

                $extra = [];
                $pattern = '/^'.preg_quote($uuid, '/').'_\d+$/';
                foreach ($filesOnDisk as $filename) {
                    if (preg_match($pattern, $filename) && !in_array($filename, $files, true)) {
                        $extra[] = $filename;
                    }
                }
                if (!empty($extra)) {
                    $preview = array_slice($extra, 0, 20);
                    $suffix = count($extra) > 20 ? '…' : '';
                    throw new FileUploaderException(sprintf('Des chunks inattendus ont été détectés (%d): %s%s', count($extra), implode(', ', $preview), $suffix), Response::HTTP_BAD_REQUEST);
                }
            } else {
                $pattern = '/^'.preg_quote($uuid, '/').'_\d+$/';
                foreach ($filesOnDisk as $filename) {
                    if (preg_match($pattern, $filename)) {
                        $files[] = $filename;
                    }
                }
            }

            if (empty($files)) {
                throw new FileUploaderException('Aucun chunk trouvé pour cet upload', Response::HTTP_BAD_REQUEST);
            }

            // Fusion des fichiers (tri inclus)
            $filepath = $this->chunkMerger->merge($uuid, $originalFilename, $files);

            if (null !== $fileSize) {
                $expectedSize = intval($fileSize);
                $actualSize = filesize($filepath);

                if (false === $actualSize || $actualSize !== $expectedSize) {
                    if (is_file($filepath)) {
                        unlink($filepath);
                    }
                    throw new FileUploaderException('La taille du fichier reconstitué ne correspond pas', Response::HTTP_BAD_REQUEST);
                }
            }

            // Validation du fichier + extraction SRID
            $result = $this->uploadValidationService->validate(
                new FinalizedUpload($uuid, $filepath, $originalFilename),
                $this->formatsCatalog->getDirectExtensions()
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
