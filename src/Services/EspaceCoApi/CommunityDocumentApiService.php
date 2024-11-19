<?php

namespace App\Services\EspaceCoApi;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class CommunityDocumentApiService extends BaseEspaceCoApiService
{
    public function __construct(HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        RequestStack $requestStack,
        LoggerInterface $logger
    ) {
        parent::__construct($httpClient, $parameters, $filesystem, $requestStack, $logger);
    }

    /**
     * @param array<string> $fields
     */
    public function getDocuments(int $communityId, array $fields = []): array
    {
        return $this->request('GET', "communities/$communityId/documents", ['fields' => $fields]);
    }

    public function addDocument(int $communityId, string $title, string $description, string $tempFilePath): array
    {
        $formFields = [
            'title' => $title,
            'description' => $description,
        ];
        $formFields['document'] = DataPart::fromPath($tempFilePath);

        $formData = new FormDataPart($formFields);
        $body = $formData->bodyToIterable();
        $headers = $formData->getPreparedHeaders()->toArray();

        return $this->request('POST', "communities/$communityId/documents", $body, [], $headers, true);
    }

    /**
     * @param array<mixed> $data
     */
    public function updateDocument(int $communityId, int $documentId, array $data): array
    {
        return $this->request('PATCH', "communities/$communityId/documents/$documentId", $data);
    }

    public function deleteDocument(int $communityId, int $documentId): array
    {
        return $this->request('DELETE', "communities/$communityId/documents/$documentId");
    }
}
