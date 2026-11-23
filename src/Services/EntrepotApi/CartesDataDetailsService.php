<?php

declare(strict_types=1);

namespace App\Services\EntrepotApi;

use App\ApiClient\ResponsePromise;
use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\StoredDataTags;
use App\Exception\ApiException;
use Symfony\Component\HttpFoundation\Response;

/**
 * Lecture des pages de détail d’une donnée stockée et d’une livraison.
 * Une livraison, une vector-db source ou une exécution disparue (404) est simplement absente ; toute autre erreur remonte.
 */
final readonly class CartesDataDetailsService
{
    // seuls tags affichés : les autres (chemin de dépôt, arborescence sauvegardée, notification) restent côté serveur
    private const DISPLAYED_TAGS = [
        CommonTags::DATASHEET_NAME,
        CommonTags::PRODUCER,
        CommonTags::PRODUCTION_DATE,
        CommonTags::PRODUCTION_YEAR,
        CommonTags::ZONE,
    ];

    private const CHECK_STATUSES = [
        'asked' => 'WAITING',
        'in_progress' => 'PROGRESS',
        'passed' => 'SUCCESS',
        'failed' => 'FAILURE',
    ];

    public function __construct(
        private StoredDataApiService $storedDataApiService,
        private UploadApiService $uploadApiService,
        private ProcessingApiService $processingApiService,
    ) {
    }

    /**
     * @return array{stored_data: array<mixed>, source_vectordb: array<mixed>|null, upload: array<mixed>|null, processing_executions: list<array<mixed>>}
     *
     * @throws ApiException si la donnée stockée est illisible
     */
    public function getStoredDataDetails(string $datastoreId, string $storedDataId): array
    {
        $storedData = $this->storedDataApiService->get($datastoreId, $storedDataId)->array();
        $tags = $storedData['tags'] ?? [];

        $uploadId = $tags[StoredDataTags::UPLOAD_ID] ?? null;
        $vectorDbId = $tags[StoredDataTags::VECTORDB_ID] ?? null;
        $executionIds = array_values(array_filter([$tags[StoredDataTags::PROC_INT_ID] ?? null, $tags[StoredDataTags::PROC_PYR_CREAT_ID] ?? null]));

        $pendings = [
            'upload' => null === $uploadId ? null : $this->uploadApiService->get($datastoreId, $uploadId),
            'checks' => null === $uploadId ? null : $this->uploadApiService->getCheckExecutions($datastoreId, $uploadId),
            'vectordb' => null === $vectorDbId ? null : $this->storedDataApiService->get($datastoreId, $vectorDbId),
        ];
        foreach ($executionIds as $index => $executionId) {
            $pendings["execution_$index"] = $this->processingApiService->getExecution($datastoreId, $executionId);
        }
        $resolved = $this->resolveOrNullOnNotFound($pendings);

        $executions = [];
        foreach (array_keys($executionIds) as $index) {
            $execution = $resolved["execution_$index"];
            if (null !== $execution) {
                $executions[] = [
                    '_id' => $execution['_id'],
                    'name' => $execution['processing']['name'] ?? null,
                    'status' => $execution['status'],
                    'output_id' => $execution['output']['stored_data']['_id'] ?? null,
                ];
            }
        }

        $vectorDb = $resolved['vectordb'];

        return [
            'stored_data' => $this->withDisplayedTags($storedData),
            'source_vectordb' => null === $vectorDb ? null : [
                '_id' => $vectorDb['_id'],
                'name' => $vectorDb['name'],
                'extent' => $vectorDb['extent'] ?? null,
                'relations' => $vectorDb['type_infos']['relations'] ?? [],
            ],
            'upload' => null === $resolved['upload'] ? null : $this->uploadDetails($datastoreId, $resolved['upload'], $resolved['checks'] ?? []),
            'processing_executions' => $executions,
        ];
    }

    /**
     * @return array<mixed>
     *
     * @throws ApiException si la livraison est illisible
     */
    public function getUploadDetails(string $datastoreId, string $uploadId): array
    {
        $resolved = $this->resolveOrNullOnNotFound([
            'upload' => $this->uploadApiService->get($datastoreId, $uploadId),
            'checks' => $this->uploadApiService->getCheckExecutions($datastoreId, $uploadId),
        ], required: ['upload']);

        return $this->uploadDetails($datastoreId, $resolved['upload'] ?? [], $resolved['checks'] ?? []);
    }

    /**
     * @param array<mixed> $upload
     * @param array<mixed> $checksByStatus réponse de GET uploads/{id}/checks, groupée par statut
     *
     * @return array<mixed>
     */
    private function uploadDetails(string $datastoreId, array $upload, array $checksByStatus): array
    {
        $checks = [];
        foreach (self::CHECK_STATUSES as $group => $status) {
            foreach ($checksByStatus[$group] ?? [] as $checkExecution) {
                $checks[] = ['_id' => $checkExecution['_id'], 'name' => $checkExecution['check']['name'] ?? null, 'status' => $status];
            }
        }

        try {
            $fileTree = $this->uploadApiService->getFileTree($datastoreId, $upload['_id'], $upload);
        } catch (ApiException $e) {
            if (Response::HTTP_NOT_FOUND !== $e->getStatusCode()) {
                throw $e;
            }
            $fileTree = [];
        }

        return [...$this->withDisplayedTags($upload), 'file_tree' => $fileTree, 'checks' => $checks];
    }

    /**
     * @param array<mixed> $entity
     *
     * @return array<mixed>
     */
    private function withDisplayedTags(array $entity): array
    {
        return ['tags' => array_intersect_key($entity['tags'] ?? [], array_flip(self::DISPLAYED_TAGS))] + $entity;
    }

    // shortcut: seul appelant d’une résolution en lot tolérante au 404 ; à déplacer dans ApiClient au deuxième appelant
    /**
     * Les requêtes sont déjà en vol : les lire une à une ne les sérialise pas.
     *
     * @param array<string, ResponsePromise|null> $pendings
     * @param list<string>                        $required clés dont le 404 remonte quand même
     *
     * @return array<string, array<mixed>|null>
     */
    private function resolveOrNullOnNotFound(array $pendings, array $required = []): array
    {
        $resolved = [];
        try {
            foreach ($pendings as $key => $pending) {
                try {
                    $resolved[$key] = $pending?->array();
                } catch (ApiException $e) {
                    if (Response::HTTP_NOT_FOUND !== $e->getStatusCode() || in_array($key, $required, true)) {
                        throw $e;
                    }
                    $resolved[$key] = null;
                }
            }
        } catch (\Throwable $e) {
            // une réponse en erreur détruite sans lecture lèverait sa propre exception à la place de celle-ci
            foreach ($pendings as $pending) {
                $pending?->getResponse()->cancel();
            }
            throw $e;
        }

        return $resolved;
    }
}
