<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\ZoomLevels;
use App\Dto\Services\Form\ServiceFormDTO;

/** Corps de la requête de création ou de remplacement d’une configuration Entrepôt depuis le formulaire de publication. */
class ServiceConfigurationRequestBuilder
{
    /**
     * @param array<mixed>  $typeInfos        `type_infos` propres au type de flux
     * @param array<mixed>  $configMetadata   liens `metadata` vers la fiche (voir CartesServiceApiService::getNewConfigMetadata)
     * @param ?array<mixed> $logo             logo d’attribution déjà déposé en annexe : url, width, height, format
     * @param ?array<mixed> $oldConfiguration configuration remplacée (modification) : son `layer_name` est immuable
     *
     * La vignette ne passe pas par ce corps : l’Entrepôt ignore `extra` à la création, voir buildThumbnailExtra()
     */
    public function build(
        ServiceFormDTO $dto,
        string $type,
        array $typeInfos,
        array $configMetadata,
        ?array $logo,
        ?array $oldConfiguration = null,
    ): array {
        $body = [
            'name' => $dto->title,
            'type' => $type,
            'type_infos' => $typeInfos,
            'metadata' => $configMetadata,
        ];

        if (null === $oldConfiguration) {
            $body['layer_name'] = $dto->technical_name;
        }

        if (null !== $dto->attribution) {
            $body['attribution'] = [
                'title' => $dto->attribution->title,
                'url' => $dto->attribution->url,
            ];
            if (null !== $logo) {
                $body['attribution']['logo'] = $logo;
            }
        }

        return $body;
    }

    /**
     * @return array<mixed> corps de modification partielle portant la vignette du flux dans `extra._search.url_vignette`
     */
    public static function buildThumbnailExtra(string $thumbnailUrl): array
    {
        return ['extra' => ['_search' => ['url_vignette' => $thumbnailUrl]]];
    }

    /**
     * Niveaux de zoom extrêmes d’une pyramide, valeurs par défaut si la pyramide n’en expose pas.
     *
     * @param array<mixed> $pyramid
     *
     * @return array{bottom_level: string, top_level: string}
     */
    public static function getPyramidZoomLevels(array $pyramid): array
    {
        if (!isset($pyramid['type_infos']['levels'])) {
            return ['bottom_level' => strval(ZoomLevels::BOTTOM_LEVEL_DEFAULT), 'top_level' => strval(ZoomLevels::TOP_LEVEL_DEFAULT)];
        }

        $levels = $pyramid['type_infos']['levels'];
        usort($levels, fn (string $a, string $b) => intval($a) - intval($b));

        return ['bottom_level' => end($levels), 'top_level' => reset($levels)];
    }
}
