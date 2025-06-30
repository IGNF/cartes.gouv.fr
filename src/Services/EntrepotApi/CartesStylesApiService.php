<?php

namespace App\Services\EntrepotApi;

class CartesStylesApiService
{
    public function __construct(
        private ConfigurationApiService $configurationApiService,
        private AnnexeApiService $annexeApiService,
    ) {
    }

    /**
     * Recherche des styles et ajout de l'url. Les styles sont désormais stockés dans extra. Cette fonction est prévue pour migrer les styles stockés dans les annexes vers extra.
     *
     * @param array<mixed> $configuration
     *
     * @return array<mixed>
     */
    public function getStyles(string $datastoreId, array $configuration): array
    {
        $styles = null;

        // vérifier si styles est présent dans extra
        if (isset($configuration['extra']['styles'])) {
            $styles = $configuration['extra']['styles'];
        }

        // vérifier si styles est présent dans une annexe
        $path = "/configuration/{$configuration['_id']}/styles.json";
        $styleAnnexes = $this->annexeApiService->getAll($datastoreId, null, $path);

        // si styles est présent dans une annexe et non dans extra, on le stocke dans extra et on supprime l'annexe
        if (count($styleAnnexes)) {
            // on ne lit l'annexe styles que si elle n'est pas déjà dans extra
            if (null === $styles) {
                $content = $this->annexeApiService->download($datastoreId, $styleAnnexes[0]['_id']);
                $styles = json_decode($content, true);

                $extra = ['styles' => $styles];
                $this->configurationApiService->modify($datastoreId, $configuration['_id'], ['extra' => $extra]);
            }

            $this->annexeApiService->remove($datastoreId, $styleAnnexes[0]['_id']);
        }

        return $styles ?? [];
    }
}
