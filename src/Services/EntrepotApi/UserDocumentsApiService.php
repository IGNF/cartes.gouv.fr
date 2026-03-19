<?php

namespace App\Services\EntrepotApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PaginatedResponse;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;

final class UserDocumentsApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.entrepot')]
        private readonly ApiClient $api,
        private readonly Filesystem $filesystem,
    ) {
    }

    /**
     * @param array<mixed>|null $query
     */
    public function getList(?array $query = []): PaginatedResponse
    {
        $query ??= [];

        if ($query['detailed'] ?? false) {
            $query['fields'] = 'name,size,description,labels,extra,public_url,mime_type'; // creation,update sont toujours retournés par l'API, on ne peut pas les demander/retirer via fields
        }

        unset($query['detailed']);

        return $this->api->get('users/me/documents', $query)->jsonWithHeaders();
    }

    public function get(string $documentId): PendingResponse
    {
        return $this->api->get("users/me/documents/$documentId");
    }

    /**
     * @param array<string> $labels
     */
    public function add(string $filePath, string $name, ?string $description = null, ?array $labels = null, ?bool $publicUrl = null): array
    {
        $formFields = [
            'name' => $name,
        ];
        if (null !== $description) {
            $formFields['description'] = $description;
        }

        if (null !== $labels) {
            $formFields['labels'] = join(',', $labels);
        }

        if (null !== $publicUrl) {
            $formFields['public_url'] = true === $publicUrl ? 'true' : 'false';
        }

        $response = $this->api->sendFile('POST', 'users/me/documents', $filePath, $formFields)->json();
        $this->filesystem->remove($filePath);

        return $response;
    }

    /**
     * @param array<mixed>  $extra
     * @param array<string> $labels
     */
    public function modify(string $documentId, ?string $name = null, ?string $description = null, ?array $extra = null, ?array $labels = null, ?bool $publicUrl = null): PendingResponse
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
            $body['labels'] = join(',', $labels);
        }

        if (null !== $publicUrl) {
            $body['public_url'] = true === $publicUrl ? 'true' : 'false';
        }

        return $this->api->patch("users/me/documents/$documentId", $body);
    }

    public function replaceFile(string $documentId, string $filePath): array
    {
        $response = $this->api->sendFile('PUT', "users/me/documents/$documentId", $filePath)->json();
        $this->filesystem->remove($filePath);

        return $response;
    }

    public function remove(string $documentId): PendingResponse
    {
        return $this->api->delete("users/me/documents/$documentId");
    }

    public function download(string $documentId): PendingResponse
    {
        return $this->api->get("users/me/documents/$documentId/file");
    }

    public function getSharings(string $documentId): PendingResponse
    {
        return $this->api->get("users/me/documents/$documentId/sharings");
    }

    /**
     * @param array<string> $userIds
     */
    public function addSharing(string $documentId, array $userIds): PendingResponse
    {
        return $this->api->post("users/me/documents/$documentId/sharings", $userIds);
    }

    /**
     * @param array<string> $userIds
     */
    public function removeSharing(string $documentId, array $userIds): PendingResponse
    {
        return $this->api->delete("users/me/documents/$documentId/sharings", ['users' => implode(',', $userIds)]);
    }
}
