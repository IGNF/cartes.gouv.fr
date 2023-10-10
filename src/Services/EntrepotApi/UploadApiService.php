<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\UploadStatuses;
use App\Exception\AppException;
use App\Exception\EntrepotApiException;

class UploadApiService extends AbstractEntrepotApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): array
    {
        if (!array_key_exists('sort', $query)) { // par défaut, trier par la date de création décroissante
            $query['sort'] = 'lastEvent,desc';
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
        } catch (EntrepotApiException $ex) {
            throw new EntrepotApiException('Création de la livraison échouée');
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
        $filepath = realpath($this->parameters->get('upload_path')."/$filename");
        $infos = pathinfo($filepath);

        $extension = $infos['extension'];

        $files = [];
        try {
            if ('zip' != $extension) {
                $files[] = $filepath;
            } else {
                // extracting zip file
                $zip = new \ZipArchive();
                if (!$zip->open($filepath)) {
                    throw new AppException('Ouverture du fichier ZIP échouée');
                }

                $folder = join([$infos['dirname'], DIRECTORY_SEPARATOR, $infos['filename']]);
                if (!$zip->extractTo($folder)) {
                    throw new AppException('Décompression du fichier zip échouée');
                }
                $zip->close();

                // add files to the upload
                $iterator = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($folder, \RecursiveDirectoryIterator::SKIP_DOTS)
                );

                $filename = null;
                foreach ($iterator as $entry) {
                    $files[] = $entry->getPathname();
                }
            }

            foreach ($files as $filepath) {
                $filename = basename($filepath);
                $this->uploadFile($datastoreId, $uploadId, $filepath, $filename);
            }

            // close the upload
            $this->close($datastoreId, $uploadId);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    /**
     * Adds a file and its md5 checksum to an existing and OPEN upload.
     *
     * @param string $datastoreId
     * @param string $uploadId
     * @param string $pathname
     * @param string $filename
     *
     * @return void
     */
    public function uploadFile($datastoreId, $uploadId, $pathname, $filename)
    {
        // posting the file itself
        $this->postFile("datastores/$datastoreId/uploads/$uploadId/data", $pathname, [
            'path' => 'data',
        ]);

        // calculating and posting the file's md5 checksum
        $md5 = \md5_file($pathname);
        $md5filePath = "$pathname.md5";
        file_put_contents($md5filePath, "$md5 data/$filename");

        $this->postFile("datastores/$datastoreId/uploads/$uploadId/md5", $md5filePath);

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
            if (array_key_exists('file_tree', $upload['tags'])) {
                return json_decode($upload['tags']['file_tree'], true);
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
        $upload = $this->get($datastoreId, $uploadId);
        if (UploadStatuses::OPEN == $upload['status']) {
            $this->close($datastoreId, $uploadId);
        }

        // sauvegarde dans les tags de l'aborescence de fichiers de la livraison avant de la supprimer, parce qu'une fois supprimée elle ne sera plus récupérable
        try {
            $fileTree = $this->getFileTree($datastoreId, $uploadId);
            $this->addTags($datastoreId, $uploadId, [
                'file_tree' => json_encode($fileTree),
            ]);
        } catch (EntrepotApiException $ex) {
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

    public function getCheckExecutionLogs(string $datastoreId, string $checkExecutionId): string
    {
        return $this->request('GET', "datastores/$datastoreId/checks/executions/$checkExecutionId/logs", [], [], [], false, false);
    }
}
