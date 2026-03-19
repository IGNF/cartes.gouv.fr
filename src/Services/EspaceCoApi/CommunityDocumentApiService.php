<?php

namespace App\Services\EspaceCoApi;

use App\ApiClient\ApiClient;
use App\ApiClient\PendingResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class CommunityDocumentApiService
{
    public function __construct(
        #[Autowire(service: 'app.api_client.espaceco')]
        private readonly ApiClient $api,
    ) {
    }

    /**
     * @param array<string> $fields
     */
    public function getDocuments(int $communityId, ?array $fields = []): PendingResponse
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->get("communities/$communityId/documents", $query);
    }

    /**
     * @param array<string> $fields
     */
    public function getDocument(int $communityId, int $documentId, ?array $fields = []): PendingResponse
    {
        $query = empty($fields) ? [] : ['fields' => $fields];

        return $this->api->get("communities/$communityId/documents/$documentId", $query);
    }

    public function addDocument(int $communityId, string $title, ?string $description, string $tempFilePath): array
    {
        $formFields = ['title' => $title];
        if (!is_null($description)) {
            $formFields['description'] = $description;
        }

        return $this->api->sendFile('POST', "communities/$communityId/documents", $tempFilePath, $formFields, [], 'document')->json();
    }

    /**
     * @param array<mixed> $data
     */
    public function updateDocument(int $communityId, int $documentId, array $data): PendingResponse
    {
        return $this->api->patch("communities/$communityId/documents/$documentId", $data);
    }

    public function deleteDocument(int $communityId, int $documentId): PendingResponse
    {
        return $this->api->delete("communities/$communityId/documents/$documentId");
    }
}
