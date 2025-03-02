<?php

namespace App\Services\EntrepotApi;

class UserDocumentsApiService extends BaseEntrepotApiService
{
    /**
     * @param array<mixed>|null $query
     */
    public function getAll(?array $query = []): array
    {
        return $this->requestAll('users/me/documents', $query);
    }

    public function get(string $documentId): array
    {
        return $this->request('GET', "users/me/documents/$documentId");
    }

    /**
     * @param array<string> $labels
     */
    public function add(string $filePath, string $name, ?string $description = null, ?array $labels = null): array
    {
        $formFields = [
            'name' => $name,
        ];
        if (null !== $description) {
            $formFields['description'] = $description;
        }

        if (null !== $labels) {
            $formFields['labels'] = $labels;
        }

        $response = $this->sendFile('POST', 'users/me/documents', $filePath, $formFields);
        $this->filesystem->remove($filePath);

        return $response;
    }

    /**
     * @param array<mixed>  $extra
     * @param array<string> $labels
     */
    public function modify(string $documentId, ?string $name = null, ?string $description = null, ?array $extra = null, ?array $labels = null, ?bool $publicUrl = null): array
    {
        $body = [];

        if (null !== $name) {
            $body['name'] = $name;
        }

        if (null !== $description) {
            $body['description'] = $description;
        }

        if (null !== $extra) {
            $body['extra'] = $extra;
        }

        if (null !== $labels) {
            $body['labels'] = $labels;
        }

        if (null !== $publicUrl) {
            $body['public_url'] = true === $publicUrl ? 'true' : 'false';
        }

        return $this->request('PATCH', "users/me/documents/$documentId", $body);
    }

    public function replaceFile(string $documentId, string $filePath): array
    {
        $response = $this->sendFile('PUT', "users/me/documents/$documentId", $filePath);
        $this->filesystem->remove($filePath);

        return $response;
    }

    public function remove(string $documentId): array
    {
        return $this->request('DELETE', "users/me/documents/$documentId");
    }

    public function download(string $documentId): string
    {
        return $this->request('GET', "users/me/documents/$documentId/file", [], [], [], false, false);
    }

    public function getSharings(string $documentId): array
    {
        return $this->request('GET', "users/me/documents/$documentId/sharings");
    }

    /**
     * @param array<string> $userIds
     */
    public function addSharing(string $documentId, array $userIds): array
    {
        return $this->request('POST', "users/me/documents/$documentId/sharings", $userIds);
    }

    /**
     * @param array<string> $userIds
     */
    public function removeSharing(string $documentId, array $userIds): array
    {
        return $this->request('DELETE', "users/me/documents/$documentId/sharings", [], [
            'users' => implode(',', $userIds),
        ]);
    }
}
