<?php

namespace App\Services\EntrepotApi;

class ProcessingApiService extends AbstractEntrepotApiService
{
    /**
     * @param array<mixed> $query
     */
    public function getAll(string $datastoreId, array $query = []): array
    {
        return $this->request('GET', "datastores/$datastoreId/processings", [], $query);
    }

    public function get(string $datastoreId, string $processingId): array
    {
        return $this->request('GET', "datastores/$datastoreId/processings/$processingId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addExecution(string $datastoreId, array $body = []): array
    {
        return $this->request('POST', "datastores/$datastoreId/processings/executions", $body);
    }

    public function launchExecution(string $datastoreId, string $executionId): void
    {
        $this->request('POST', "datastores/$datastoreId/processings/executions/$executionId/launch");
    }

    /**
     * @param array<mixed> $query
     */
    public function getAllExecutions(string $datastoreId, array $query = []): array
    {
        return $this->request('GET', "datastores/$datastoreId/processings/executions", [], $query);
    }

    public function getExecution(string $datastoreId, string $processingExecutionId): array
    {
        return $this->request('GET', "datastores/$datastoreId/processings/executions/$processingExecutionId");
    }

    public function getExecutionLogs(string $datastoreId, string $processingExecutionId): string
    {
        return $this->request('GET', "datastores/$datastoreId/processings/executions/$processingExecutionId/logs", [], [], [], false, false);
    }

    public function removeExecution(string $datastoreId, string $processingExecutionId): void
    {
        $this->request('DELETE', "datastores/$datastoreId/processings/executions/$processingExecutionId");
    }

    public function getExecutionInfo(string $datastoreId, string $processingExecutionId): array
    {
        $result = [];
        $processingExecution = $this->getExecution($datastoreId, $processingExecutionId);
        $result['info'] = $this->getDatesAndDelays($processingExecution);
        $result['logs'] = $this->getExecutionLogs($datastoreId, $processingExecutionId);

        return $result;
    }

    /**
     * @param array<mixed> $infos
     */
    private function getDatesAndDelays(array $infos): array
    {
        $result = [
            'creation' => null,
            'start' => null,
            'finish' => null,
        ];

        $creationDate = null;
        $startDate = null;
        $finishDate = null;
        if (isset($infos['creation'])) {
            $creationDate = new \DateTime($infos['creation']);
            $result['creation'] = $creationDate->format('H:i:s');
        }
        if (isset($infos['start'])) {
            $startDate = new \DateTime($infos['start']);
            $result['start'] = $startDate->format('H:i:s');
        }
        if (isset($infos['finish'])) {
            $finishDate = new \DateTime($infos['finish']);
            $result['finish'] = $finishDate->format('H:i:s');
        }

        // Calcul des durees
        if ($startDate && $creationDate) {
            $interval = $startDate->diff($creationDate);
            $result['start_delay'] = $this->formatInterval($interval);
        }
        if ($finishDate && $startDate) {
            $interval = $finishDate->diff($startDate);
            $result['exec_delay'] = $this->formatInterval($interval);
        }

        return $result;
    }

    private function formatInterval(\DateInterval $interval): string
    {
        $format = '';
        if ($interval->d) {
            ($interval->d > 1) ? $format .= '%d jours' : '%d jour';
        }
        if ($interval->i) {
            $formatMin = ($interval->i > 1) ? '%i minutes' : '%i minute';
            if ($format) {
                $format .= ' ';
            }

            $format .= $formatMin;
        }

        if ($format) {
            $format .= ' ';
        }

        $format .= '%s secondes';

        return $interval->format($format);
    }
}
