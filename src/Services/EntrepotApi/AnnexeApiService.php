<?php

namespace App\Services\EntrepotApi;

class AnnexeApiService extends AbstractEntrepotApiService
{
    public function getAll(string $datastoreId, string $mimeType = null, string $path = null): array
    {
        $query = [];
        if ($mimeType) {
            $query['mime_type'] = $mimeType;
        }
        if ($path) {
            $query['path'] = $path;
        }

        return $this->requestAll("datastores/$datastoreId/annexes", $query);
    }

    public function get(string $datastoreId, string $annexeId): array
    {
        // TODO : mettre à jour l'url annexe
        $apiPlageAnnexeUrl = $this->parameters->get('api_plage_annexe_url');
        $response = $this->request('GET', "datastores/$datastoreId/annexes/$annexeId");
        $response['paths'][0] = $apiPlageAnnexeUrl.$response['paths'][0];

        return $response;
    }

    /**
     * @param array<string> $paths
     * @param array<string> $labels
     */
    public function add(string $datastoreId, string $annexeFilePath, array $paths, array $labels = null, bool $published = true): array
    {
        $response = $this->sendFile('POST', "datastores/$datastoreId/annexes", $annexeFilePath, [
            'published' => true === $published ? 'true' : 'false',
            'paths' => join(',', $paths), // ici on fait un join parce que c'est un FormData, qui ne gère pas bien les virgules
        ]);

        $response = $this->modify($datastoreId, $response['_id'], null, $labels, null);

        $this->filesystem->remove($annexeFilePath);

        return $response;
    }

    /**
     * @param array<string> $paths
     * @param array<string> $labels
     */
    public function modify(string $datastoreId, string $annexeId, array $paths = null, array $labels = null, bool $published = null): array
    {
        $body = [];

        if ($paths) {
            $body['paths'] = $paths;
        }

        if ($labels) {
            $body['labels'] = $labels;
        }

        if (null !== $published) {
            $body['published'] = true === $published ? 'true' : 'false';
        }

        return $this->request('PATCH', "datastores/$datastoreId/annexes/$annexeId", $body);
    }

    public function replaceFile(string $datastoreId, string $annexeId, string $annexeFilePath): array
    {
        $response = $this->sendFile('PUT', "datastores/$datastoreId/annexes/$annexeId", $annexeFilePath);

        $this->filesystem->remove($annexeFilePath);

        return $response;
    }

    public function publish(string $datastoreId, string $annexeId): array
    {
        return $this->request('PATCH', "datastores/$datastoreId/annexes/$annexeId", [
            'published' => true,
        ]);
    }

    public function remove(string $datastoreId, string $annexeId): void
    {
        $this->request('DELETE', "datastores/$datastoreId/annexes/$annexeId");
    }
}
