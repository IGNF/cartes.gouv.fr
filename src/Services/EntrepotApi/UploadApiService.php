<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\UploadStatuses;
use App\Constants\EntrepotApi\UploadTags;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Services\FileUploader\Format\Zip\ZipUploadPolicy;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class UploadApiService extends BaseEntrepotApiService
{
    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        RequestStack $requestStack,
        LoggerInterface $logger,
        protected CacheInterface $cache,
        private readonly ZipUploadPolicy $zipUploadPolicy,
    ) {
        parent::__construct($httpClient, $parameters, $filesystem, $requestStack, $cache, $logger);
    }

    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): array
    {
        if (!array_key_exists('sort', $query)) { // par défaut, trier par la date du dernier évènement décroissante
            $query['sort'] = 'last_event,desc';
        }

        if (array_key_exists('fields', $query) && is_array($query['fields']) && !empty($query['fields'])) {
            $query['fields'] = implode(',', $query['fields']);
        }

        return $this->requestAll("datastores/$datastoreId/uploads", $query);
    }

    /**
     * @param mixed[] $query
     */
    public function getAllDetailed(string $datastoreId, array $query = []): array
    {
        $uploads = $this->getAll($datastoreId, $query);

        foreach ($uploads as &$upload) {
            $upload = $this->get($datastoreId, $upload['_id']);
        }

        return $uploads;
    }

    public function get(string $datastoreId, string $uploadId): array
    {
        return $this->request('GET', "datastores/$datastoreId/uploads/$uploadId");
    }

    /**
     * Déclare une nouvelle livraison.
     *
     * @param array<mixed> $uploadData
     *
     * @return array<mixed>
     */
    public function add(string $datastoreId, $uploadData)
    {
        try {
            return $this->request('POST', "datastores/$datastoreId/uploads", [
                'name' => $uploadData['name'],
                'description' => $uploadData['description'],
                'type' => $uploadData['type'],
                'srs' => $uploadData['srs'],
            ]);
        } catch (ApiException $ex) {
            throw new ApiException('Création de la livraison échouée');
        }
    }

    /**
     * @param string $datastoreId
     * @param string $uploadId
     * @param string $filename
     *
     * @return void
     */
    public function addFile($datastoreId, $uploadId, $filename)
    {
        $uploadRoot = realpath((string) $this->parameters->get('upload_path'));
        if (false === $uploadRoot) {
            throw new AppException('Chemin racine des uploads introuvable', 500, ['message' => 'Chemin racine des uploads introuvable']);
        }
        $uploadRoot = rtrim($uploadRoot, DIRECTORY_SEPARATOR);

        $filepath = realpath($uploadRoot."/$filename");
        if (false === $filepath) {
            throw new AppException('Fichier à envoyer introuvable', 400, ['message' => 'Fichier à envoyer introuvable']);
        }

        if (0 !== strpos($filepath, $uploadRoot.DIRECTORY_SEPARATOR)) {
            throw new AppException('Chemin de fichier invalide', 400, ['message' => 'Chemin de fichier invalide']);
        }

        $infos = pathinfo($filepath);
        $extension = strtolower((string) ($infos['extension'] ?? ''));
        if ('' === $extension) {
            throw new AppException('Extension du fichier à envoyer introuvable', 400, ['message' => 'Extension du fichier à envoyer introuvable']);
        }

        /** @var array<int, array{pathname: string, relativePath: string}> $files */
        $files = [];
        $extractedFolder = null;
        try {
            if ('zip' !== $extension) {
                $files[] = [
                    'pathname' => $filepath,
                    'relativePath' => basename($filepath),
                ];
            } else {
                $zip = new \ZipArchive();
                if (true !== $zip->open($filepath)) {
                    throw new AppException('Ouverture du fichier ZIP échouée');
                }

                $folder = $infos['dirname'].DIRECTORY_SEPARATOR.$infos['filename'].'_'.bin2hex(random_bytes(6));
                $extractedFolder = $folder;
                $this->filesystem->mkdir($folder);

                try {
                    if (true !== $zip->extractTo($folder)) {
                        throw new AppException('Décompression du fichier zip échouée');
                    }
                } finally {
                    $zip->close();
                }

                // add files to the upload
                $iterator = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($folder, \RecursiveDirectoryIterator::SKIP_DOTS)
                );

                $realFolder = realpath($folder) ?: null;

                foreach ($iterator as $entry) {
                    if (!$entry->isFile()) {
                        continue;
                    }

                    if (null !== $realFolder) {
                        $realPath = $entry->getRealPath();
                        if (false === $realPath || 0 !== strpos($realPath, $realFolder.DIRECTORY_SEPARATOR)) {
                            throw new AppException('Archive corrompu');
                        }
                    }

                    $entryPathname = $entry->getPathname();
                    $prefix = rtrim($folder, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
                    $relative = str_starts_with($entryPathname, $prefix) ? substr($entryPathname, strlen($prefix)) : basename($entryPathname);
                    $relative = str_replace(DIRECTORY_SEPARATOR, '/', $relative);

                    // Le ZIP a déjà été validé/"nettoyé" lors du finalize côté FileUploader.
                    // On conserve ici les mêmes règles permissives que ZipFormatHandler (entryName OU extension) pour couvrir les suffixes spéciaux (.shp.xml, etc.).
                    if (!$this->zipUploadPolicy->isAllowedEntryName($relative) && !$this->zipUploadPolicy->isAllowedExtension(strtolower(pathinfo($relative, PATHINFO_EXTENSION)))) {
                        continue;
                    }

                    $item = [
                        'pathname' => $entryPathname,
                        'relativePath' => $relative,
                    ];

                    $files[] = $item;
                }

                if (0 === count($files)) {
                    throw new AppException('Aucun fichier valide trouvé dans le ZIP');
                }
            }

            foreach ($files as $file) {
                $this->uploadFile($datastoreId, $uploadId, $file['pathname'], $file['relativePath']);
            }

            // close the upload
            $this->close($datastoreId, $uploadId);
        } finally {
            if (null !== $extractedFolder) {
                $this->filesystem->remove($extractedFolder);
            }

            if ('zip' === $extension) {
                $this->filesystem->remove($filepath);
            }
        }
    }

    /**
     * Adds a file and its md5 checksum to an existing and OPEN upload.
     */
    public function uploadFile(string $datastoreId, string $uploadId, string $pathname, string $relativePath): void
    {
        // envoi du fichier téléversé par l'utilisateur
        $this->sendFile('POST', "datastores/$datastoreId/uploads/$uploadId/data", $pathname, [], [
            'path' => "data/{$relativePath}",
        ]);

        // calcul et envoi du md5 du fichier téléversé par l'utilisateur
        $md5 = \md5_file($pathname);
        if (false === $md5) {
            throw new AppException('Calcul du md5 échoué');
        }

        $md5Line = sprintf("%s  %s\n", $md5, "data/$relativePath");
        $md5filePath = "$pathname.md5";
        if (false === \file_put_contents($md5filePath, $md5Line, \LOCK_EX)) {
            throw new AppException('Écriture du fichier md5 échouée');
        }

        $this->sendFile('POST', "datastores/$datastoreId/uploads/$uploadId/md5", $md5filePath);

        $this->filesystem->remove($pathname);
        $this->filesystem->remove($md5filePath);
    }

    /**
     * @param string $datastoreId
     * @param string $uploadId
     *
     * @return array
     */
    public function getFileTree($datastoreId, $uploadId)
    {
        $upload = $this->get($datastoreId, $uploadId);
        if (UploadStatuses::DELETED == $upload['status'] || UploadStatuses::OPEN == $upload['status']) {
            if (array_key_exists(UploadTags::FILE_TREE, $upload['tags'])) {
                return json_decode($upload['tags'][UploadTags::FILE_TREE], true);
            }

            return [];
        }

        return $this->request('GET', "datastores/$datastoreId/uploads/$uploadId/tree");
    }

    /**
     * Opens an existing upload only if it isn't already OPEN.
     *
     * @param string $datastoreId
     * @param string $uploadId
     *
     * @return void
     */
    public function open($datastoreId, $uploadId)
    {
        if (UploadStatuses::OPEN != $this->get($datastoreId, $uploadId)['status']) {
            $this->request('POST', "datastores/$datastoreId/uploads/$uploadId/open");
        }
    }

    /**
     * Closes an existing upload only if it isn't already CLOSED.
     *
     * @param string $datastoreId
     * @param string $uploadId
     *
     * @return void
     */
    public function close($datastoreId, $uploadId)
    {
        if (UploadStatuses::CLOSED != $this->get($datastoreId, $uploadId)['status']) {
            $this->request('POST', "datastores/$datastoreId/uploads/$uploadId/close");
        }
    }

    /**
     * @param array<mixed> $tags
     */
    public function addTags(string $datastoreId, string $uploadId, $tags): array
    {
        return $this->request('POST', "datastores/$datastoreId/uploads/$uploadId/tags", $tags);
    }

    /**
     * @param array<string> $tags
     */
    public function removeTags(string $datastoreId, string $uploadId, $tags): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/uploads/$uploadId/tags", [], [
            'tags' => $tags,
        ]);
    }

    public function remove(string $datastoreId, string $uploadId): mixed
    {
        // sauvegarde dans les tags de l'aborescence de fichiers de la livraison avant de la supprimer, parce qu'une fois supprimée elle ne sera plus récupérable
        try {
            $fileTree = $this->getFileTree($datastoreId, $uploadId);
            $this->addTags($datastoreId, $uploadId, [
                UploadTags::FILE_TREE => json_encode($fileTree),
            ]);
        } catch (ApiException $ex) {
            // ne rien faire, tant pis si la récupération de l'arborescence a échoué
        }

        return $this->request('DELETE', "datastores/$datastoreId/uploads/$uploadId");
    }

    public function getEvents(string $datastoreId, string $uploadId): array
    {
        return $this->request('GET', "datastores/$datastoreId/uploads/$uploadId/events");
    }

    public function getCheckExecutions(string $datastoreId, string $uploadId): array
    {
        return $this->request('GET', "datastores/$datastoreId/uploads/$uploadId/checks");
    }

    public function getChecks(string $datastoreId): array
    {
        return $this->request('GET', "datastores/$datastoreId/checks");
    }

    public function getCheck(string $datastoreId, string $checkId): array
    {
        return $this->request('GET', "datastores/$datastoreId/checks/$checkId");
    }

    public function getCheckExecution(string $datastoreId, string $checkExecutionId): array
    {
        return $this->request('GET', "datastores/$datastoreId/checks/executions/$checkExecutionId");
    }

    public function getCheckExecutionLogs(string $datastoreId, string $checkExecutionId): array
    {
        return $this->request('GET', "datastores/$datastoreId/checks/executions/$checkExecutionId/logs", [], [], [], false, true);
    }
}
