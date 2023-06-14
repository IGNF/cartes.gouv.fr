<?php

namespace App\Services\EntrepotApi;

use App\Constants\UploadStatuses;
use App\Exception\AppException;
use App\Exception\EntrepotApiException;

class UploadApiService extends AbstractEntrepotApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): array
    {
        $query['sort'] = 'date:desc'; // sort by creation date in descending order

        return $this->requestAll("datastores/$datastoreId/uploads", $query);
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
     * @return array<mixed> API response
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
        $this->postFile("datastores/$datastoreId/uploads/$uploadId/data", $pathname);

        // calculating and posting the file's md5 checksum
        $md5 = \md5_file($pathname);
        $md5filePath = "$pathname.md5";
        file_put_contents($md5filePath, "$md5 data/$filename");

        $this->postFile("datastores/$datastoreId/uploads/$uploadId/md5", $md5filePath);

        $this->filesystem->remove($pathname);
        $this->filesystem->remove($md5filePath);
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
     * @param string $datastoreId
     * @param string $uploadId
     * @param array  $tags
     *
     * @return void
     */
    public function addTags($datastoreId, $uploadId, $tags)
    {
        $this->request('POST', "datastores/$datastoreId/uploads/$uploadId/tags", $tags);
    }

    /**
     * @param string $datastoreId
     * @param string $uploadId
     * @param array  $tags
     *
     * @return void
     */
    public function removeTags($datastoreId, $uploadId, $tags)
    {
        $this->request('DELETE', "datastores/$datastoreId/uploads/$uploadId/tags", [], [
            'tags' => $tags,
        ]);
    }
}
