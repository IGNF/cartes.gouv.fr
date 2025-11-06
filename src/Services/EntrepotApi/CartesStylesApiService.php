<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\ConfigurationMetadataTypes;
use App\Constants\EntrepotApi\ConfigurationTypes;

class CartesStylesApiService
{
    public function __construct(
        private ConfigurationApiService $configurationApiService,
        private AnnexeApiService $annexeApiService,
    ) {
    }

    /**
     * Recherche des styles et ajout de l'url. Les styles sont désormais stockés dans extra. Cette fonction est prévue pour migrer les styles stockés dans les annexes vers extra.
     * La structure des styles est également mise à jour pour ajouter technical_name si absent.
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

        // migration des styles depuis une annexe vers extra
        // si styles est présent dans une annexe et non dans extra, on le stocke dans extra et on supprime l'annexe
        if (count($styleAnnexes)) {
            // on ne lit l'annexe styles que si elle n'est pas déjà dans extra
            if (null === $styles) {
                $content = $this->annexeApiService->download($datastoreId, $styleAnnexes[0]['_id']);
                $styles = json_decode($content, true);

                $this->updateStyles($datastoreId, $configuration['_id'], $styles);
            }

            $this->annexeApiService->remove($datastoreId, $styleAnnexes[0]['_id']);
        }

        // changement de structure des styles : ajout de technical_name
        // on génère un technical_name à partir de style_name si absent
        if (is_array($styles)) {
            $changed = false;
            foreach ($styles as $index => $style) {
                if (!isset($style['technical_name']) || empty($style['technical_name'])) {
                    $suggestedTechName = $this->suggestTechnicalName($style['name'] ?? '');
                    $styles[$index]['technical_name'] = $suggestedTechName;
                    $changed = true;
                }
            }
            // mise à jour de la configuration si des technical_name ont été ajoutés
            if ($changed) {
                $this->updateStyles($datastoreId, $configuration['_id'], $styles);
            }
        }

        return $styles ?? [];
    }

    /**
     * Mise à jour des styles dans extra.
     *
     * @param array<mixed> $styles
     */
    public function updateStyles(string $datastoreId, string $configurationId, array $styles): void
    {
        $extra = ['styles' => $styles];
        $this->configurationApiService->modify($datastoreId, $configurationId, ['extra' => $extra]);
    }

    /**
     * @param array<mixed> $configuration
     * @param array<mixed> $styles
     */
    public function updateStylesTmsMetadata(string $datastoreId, array $configuration, string $offeringId, array $styles): void
    {
        if (ConfigurationTypes::WMTSTMS !== $configuration['type']) {
            return;
        }

        $requestBody = [
            'type' => $configuration['type'],
            'name' => $configuration['name'],
            'type_infos' => [
                'title' => $configuration['type_infos']['title'],
                'abstract' => $configuration['type_infos']['abstract'],
                'keywords' => $configuration['type_infos']['keywords'],
                'used_data' => $configuration['type_infos']['used_data'],
            ],
        ];

        if (isset($configuration['attribution']['title']) && isset($configuration['attribution']['url'])) {
            $requestBody['attribution'] = [
                'title' => $configuration['attribution']['title'],
                'url' => $configuration['attribution']['url'],
            ];
        }

        $oldStyleUrlRegex = '/^https?:\/\/[^\s\/$.?#].[^\s]*\/style\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.json$/';
        $styleUrlRegex = '/^https?:\/\/[^\s\/$.?#].[^\s]*\/style\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}_[A-Za-z0-9_-]+\.json$/';

        $metadataList = $configuration['metadata'];

        // suppression des fichiers de style venant de cartes.gouv.fr (voir styleUrlRegex)
        $metadataList = array_values(array_filter($metadataList, function ($metadata) use ($styleUrlRegex, $oldStyleUrlRegex) {
            return !('application/json' === $metadata['format'] && (preg_match($styleUrlRegex, $metadata['url']) || preg_match($oldStyleUrlRegex, $metadata['url'])) && ConfigurationMetadataTypes::OTHER === $metadata['type']);
        }));

        // ajout des fichiers de style à jour dans la metadata de la configuration
        foreach ($styles as $style) {
            foreach ($style['layers'] as $layer) {
                $metadataList[] = [
                    'format' => 'application/json',
                    'url' => $layer['url'],
                    'type' => ConfigurationMetadataTypes::OTHER,
                ];
            }
        }

        $requestBody['metadata'] = $metadataList;

        $this->configurationApiService->replace($datastoreId, $configuration['_id'], $requestBody);
        $this->configurationApiService->syncOffering($datastoreId, $offeringId);
    }

    private function suggestTechnicalName(string $name): string
    {
        $name = trim($name);
        $name = iconv('UTF-8', 'ASCII//TRANSLIT', $name);
        $name = strtolower($name);
        $name = preg_replace('/\s+/', '_', $name);
        $name = preg_replace('/[^a-z0-9_-]/', '', $name);

        return $name;
    }
}
