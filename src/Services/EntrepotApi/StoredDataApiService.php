<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\StoredDataStatuses;
use App\Constants\EntrepotApi\StoredDataTypes;

class StoredDataApiService extends AbstractEntrepotApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): array
    {
        if (!array_key_exists('sort', $query)) { // par défaut, trier par la date de création décroissante
            $query['sort'] = 'date:desc';
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

    public function getDetailed(string $datastoreId, string $storedDataId): array
    {
        $storedData = $this->get($datastoreId, $storedDataId);

        // fetch information specific to the type of stored data
        if (StoredDataTypes::VECTOR_DB == $storedData['type']) {
            if (array_key_exists('proc_int_id', $storedData['tags'])) {
                $vectordbProcInt = $this->entrepotApiService->processing->getExecution($datastoreId, $storedData['tags']['proc_int_id']);
                $storedData['input_upload_id'] = $vectordbProcInt['inputs']['upload'][0]['_id'];
            }
        } elseif (StoredDataTypes::ROK4_PYRAMID_VECTOR == $storedData['type']) {
            $offerings = $this->entrepotApiService->configuration->getAllOfferings($datastoreId, [
                    'stored_data' => $storedData['_id'],
                ]);

            // check if pyramid is already published or not
            if (0 == count($offerings)) {
                $storedData['tags']['published'] = false;
            } else {
                $storedData['tags']['published'] = true;
            }
        }

        if (array_key_exists('last_event', $storedData)) {
            $storedData['last_event']['date_text'] = (new \DateTime($storedData['last_event']['date'], new \DateTimeZone('Europe/Paris')))->format('d/m/y H\hi'); // d F Y
        }

        return $storedData;
    }

    public function modifyName(string $datastoreId, string $storedDataId, string $newName): array
    {
        return $this->request('PATCH', "datastores/$datastoreId/stored_data/$storedDataId", [
            'name' => $newName,
        ]);
    }

    public function remove(string $datastoreId, string $storedDataId): void
    {
        $storedData = $this->get($datastoreId, $storedDataId);
        if (StoredDataTypes::ROK4_PYRAMID_VECTOR == $storedData['type'] && array_key_exists('initial_pyramid_id', $storedData['tags'])) {
            $this->removeTags($datastoreId, $storedData['tags']['initial_pyramid_id'], ['update_pyramid_id']);
        }

        if (StoredDataStatuses::CREATED == $storedData['status'] && array_key_exists('proc_int_id', $storedData['tags'])) {
            $this->entrepotApiService->processing->removeExecution($datastoreId, $storedData['tags']['proc_int_id']);
        }

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

    /**
     * Recupere les tags de style (styles et default_style) dans la storedData.
     */
    public function getTagStyles(string $datastoreId, string $storedDataId): array
    {
        $storedData = $this->get($datastoreId, $storedDataId);

        $styles = [];
        $defaultStyle = null;

        if (isset($storedData['tags']['styles'])) {
            $styles = json_decode($storedData['tags']['styles'], true);
        }

        if (isset($storedData['tags']['default_style'])) {
            $defaultStyle = $storedData['tags']['default_style'];
        } elseif (count($styles)) {    // S'il n'est pas dans les tags, on prend le dernier
            $name = array_key_last($styles);
            $defaultStyle = $styles[$name];
        }

        return ['styles' => $styles, 'default_style' => $defaultStyle];
    }

    /**
     * Recupere les tags de style (styles et default_style) dans la storedData et ajoute l'url
     * pour chaque annexe.
     */
    public function getStyles(string $datastoreId, string $storedDataId): array
    {
        $storedData = $this->get($datastoreId, $storedDataId);

        $styles = [];
        $defaultStyle = null;
        if (isset($storedData['tags']['styles'])) {
            $tagStyles = json_decode($storedData['tags']['styles'], true);
            foreach ($tagStyles as $id => $name) {
                $annexe = $this->entrepotApiService->annexe->get($datastoreId, $id);
                $styles[$id] = ['name' => $name, 'url' => $annexe['paths'][0]];
            }
        }

        if (isset($storedData['tags']['default_style'])) {
            $defaultStyle = $storedData['tags']['default_style'];
        } elseif (count($styles)) {    // S'il n'est pas dans les tags, on prend le dernier
            $defaultStyle = array_key_last($styles);
        }

        // On met le style par defaut au debut
        if (!is_null($defaultStyle)) {
            $defStyle = [$defaultStyle => $styles[$defaultStyle]];
            unset($styles[$defaultStyle]);
            $styles = array_merge($defStyle, $styles);
        }

        return ['styles' => $styles, 'defaultStyle' => $defaultStyle];
    }
}
