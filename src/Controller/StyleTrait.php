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
        $path = "/configuration/$configId/styles.json";
        $styleAnnexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, $path);

        $styles = [];
        if (count($styleAnnexes)) {
            $content = $this->entrepotApiService->annexe->download($datastoreId, $styleAnnexes[0]['_id']);
            $styles = json_decode($content, true);
        }
        
        return $styles;
    }
}
