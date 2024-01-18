<?php

namespace App\Controller;

use App\Constants\EntrepotApi\OfferingTypes;

trait StyleTrait
{
    /**
     * Recherche des styles et ajout de l'url.
     *
     * @return array<mixed>
     */
    // TODO PEUT ETRE S'APPUYER SUR LES TAGS
    private function getStyles(string $datastoreId, string $configId): array
    {
        $path = "/configuration/$configId/styles.json";
        $styleAnnexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, $path);

        $styles = [];
        if (count($styleAnnexes)) {
            $content = $this->entrepotApiService->annexe->download($datastoreId, $styleAnnexes[0]['_id']);
            $styles = json_decode($content, true);
        }

        return $styles;
    }

    /**
     * @param array<mixed> $offering
     */
    private function getShareUrl(string $datastoreId, array $offering): ?string
    {
        $datastore = $this->entrepotApiService->datastore->get($datastoreId);
        $endpointId = $offering['endpoint']['_id'];

        $endpoint = $this->entrepotApiService->datastore->getEndpoint($datastoreId, $endpointId);
        $shareUrl = null;

        switch ($offering['type']) {
            case OfferingTypes::WFS:
            case OfferingTypes::WMSVECTOR:
                $annexeUrl = $this->getParameter('annexes_url');
                $shareUrl = join('/', [$annexeUrl, $datastore['technical_name'],  $endpoint['endpoint']['technical_name'], 'capabilities.xml']);
                break;

            case OfferingTypes::WMTSTMS:
                if (isset($offering['tms_metadata']['tiles'][0])) {
                    $shareUrl = $offering['tms_metadata']['tiles'][0];
                }
                break;

            default:
                break;
        }

        return $shareUrl;
    }
}
