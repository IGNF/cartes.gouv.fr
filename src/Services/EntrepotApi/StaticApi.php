<?php

namespace App\Services\EntrepotApi;

class StaticApi extends AbstractEntrepotApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, $query = []): array
    {
        return $this->requestAll("datastores/$datastoreId/statics", $query);
    }

    public function get(string $datastoreId, string $staticId): array
    {
        return $this->request('GET', "datastores/$datastoreId/statics/$staticId");
    }

    public function add(string $datastoreId, string $filepath, string $name, string $type, ?string $description = null): array
    {
        $formFields = [
            'type' => $type,
            'name' => $name,
        ];

        if ($description) {
            $formFields['description'] = $description;
        }

        $response = $this->sendFile('POST', "datastores/$datastoreId/statics", $filepath, $formFields);

        $this->filesystem->remove($filepath);

        return $response;
    }

    public function replaceFile(string $datastoreId, string $staticId, string $filepath): array
    {
        $response = $this->sendFile('PUT', "datastores/$datastoreId/statics/$staticId", $filepath);

        $this->filesystem->remove($filepath);

        return $response;
    }

    public function delete(string $datastoreId, string $staticId): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/statics/$staticId");
    }

    /**
     * @param array<mixed> $body
     */
    public function modifyInfo(string $datastoreId, string $staticId, array $body): array
    {
        return $this->request('PATCH', "datastores/$datastoreId/statics/$staticId", $body);
    }

    public function downloadFile(string $datastoreId, string $staticId): mixed
    {
        return $this->request('GET', "datastores/$datastoreId/statics/$staticId/file");
    }
}
