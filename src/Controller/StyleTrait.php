<?php

namespace App\Controller;

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
        $datastore = $this->entrepotApiService->datastore->get($datastoreId);
        $annexeUrl = $this->getParameter('annexes_url');

        $path = "/configuration/$configId/styles.json";
        $styleAnnexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, $path);

        $styles = [];
        if (count($styleAnnexes)) {
            $content = $this->entrepotApiService->annexe->download($datastoreId, $styleAnnexes[0]['_id']);
            $styles = json_decode($content, true);
        }

        // Ajout des urls
        foreach ($styles as &$style) {
            foreach ($style['layers'] as &$layer) {
                $annexe = $this->entrepotApiService->annexe->get($datastoreId, $layer['annexe_id']);
                $layer['url'] = $annexeUrl.'/'.$datastore['technical_name'].$annexe['paths'][0];
            }
        }

        return $styles;
    }
}
