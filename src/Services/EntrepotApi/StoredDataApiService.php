<?php

namespace App\Services\EntrepotApi;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class StoredDataApiService extends BaseEntrepotApiService
{
    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        RequestStack $requestStack,
        LoggerInterface $logger,
        protected CacheInterface $cache,
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

        return $this->requestAll("datastores/$datastoreId/stored_data", $query);
    }

    /**
     * @param mixed[] $query
     */
    public function getAllDetailed(string $datastoreId, array $query = []): array
    {
        $storedDataList = $this->getAll($datastoreId, $query);

        foreach ($storedDataList as &$storedData) {
            $storedData = $this->get($datastoreId, $storedData['_id']);
        }

        return $storedDataList;
    }

    public function get(string $datastoreId, string $storedDataId): array
    {
        return $this->request('GET', "datastores/$datastoreId/stored_data/$storedDataId");
    }

    public function modifyName(string $datastoreId, string $storedDataId, string $newName): array
    {
        return $this->request('PATCH', "datastores/$datastoreId/stored_data/$storedDataId", [
            'name' => $newName,
        ]);
    }

    public function remove(string $datastoreId, string $storedDataId): void
    {
        $this->request('DELETE', "datastores/$datastoreId/stored_data/$storedDataId");
    }

    /**
     * @param array<mixed> $tags
     */
    public function addTags(string $datastoreId, string $storedDataId, array $tags): array
    {
        return $this->request('POST', "datastores/$datastoreId/stored_data/$storedDataId/tags", $tags);
    }

    /**
     * @param array<string> $tags
     */
    public function removeTags(string $datastoreId, string $storedDataId, $tags): array
    {
        return $this->request('DELETE', "datastores/$datastoreId/stored_data/$storedDataId/tags", [], [
            'tags' => $tags,
        ]);
    }
}
