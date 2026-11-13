<?php

declare(strict_types=1);

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\ZoomLevels;
use App\Dto\Services\CommonDTO;
use App\Dto\Services\Form\ServiceAttributionFormDTO;
use App\Dto\Services\Form\ServiceFormDTO;

/** Corps de la requête de création d’une configuration Entrepôt depuis le formulaire de publication. */
class ServiceConfigurationRequestBuilder
{
    /**
     * La vignette n’en fait pas partie : l’Entrepôt ignore `extra` à la création, voir buildThumbnailExtra().
     *
     * @param array<mixed>                                                     $typeInfos      `type_infos` propres au type de flux
     * @param array<mixed>                                                     $configMetadata liens `metadata` vers la fiche (CartesServiceApiService::getNewConfigMetadata)
     * @param array{url: string, width: int, height: int, format: string}|null $logo           logo d’attribution déjà déposé en annexe
     *
     * @return array<mixed>
     */
    public function build(ServiceFormDTO $dto, string $type, array $typeInfos, array $configMetadata, ?array $logo): array
    {
        $body = [
            'name' => $dto->title,
            'layer_name' => $dto->technical_name,
            'type' => $type,
            'type_infos' => $typeInfos,
            'metadata' => $configMetadata,
        ];

        if ($dto->attribution instanceof ServiceAttributionFormDTO) {
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
     * Seul un PATCH écrit `extra` (le POST et le PUT l’ignorent), en remplaçant l’objet entier : à passer par ConfigurationApiService::modify, qui fusionne.
     *
     * @return array<mixed>
     */
    public static function buildThumbnailExtra(string $thumbnailUrl): array
    {
        return ['extra' => ['_search' => ['url_vignette' => $thumbnailUrl]]];
    }

    /**
     * Corps de configuration des formulaires classiques, à supprimer avec eux.
     *
     * @param array<mixed>  $typeInfos
     * @param ?array<mixed> $oldConfiguration
     *
     * @return array<mixed>
     */
    public static function buildFromCommonDto(string $type, CommonDTO $dto, array $typeInfos, ?array $oldConfiguration = null): array
    {
        $body = [
            'name' => $dto->service_name,
            'type' => $type,
            'type_infos' => $typeInfos,
        ];

        // seulement pour la création d'une nouvelle publication
        if (null === $oldConfiguration) {
            $body['layer_name'] = $dto->technical_name;
        }

        if (!empty($dto->attribution_text) && !empty($dto->attribution_url)) {
            $body['attribution'] = [
                'title' => $dto->attribution_text,
                'url' => $dto->attribution_url,
            ];
            // le formulaire classique ne gère pas le logo posé par le nouveau formulaire : le PUT l’effacerait
            if (isset($oldConfiguration['attribution']['logo'])) {
                $body['attribution']['logo'] = $oldConfiguration['attribution']['logo'];
            }
        }

        if (isset($oldConfiguration['metadata'])) {
            $body['metadata'] = $oldConfiguration['metadata'];
        }

        return $body;
    }

    /**
     * @param array<mixed> $pyramid
     *
     * @return array{bottom_level: string, top_level: string}
     */
    public static function getPyramidZoomLevels(array $pyramid): array
    {
        // niveaux absents ou vides : niveaux par défaut
        if (empty($pyramid['type_infos']['levels'])) {
            return ['bottom_level' => strval(ZoomLevels::BOTTOM_LEVEL_DEFAULT), 'top_level' => strval(ZoomLevels::TOP_LEVEL_DEFAULT)];
        }

        $levels = $pyramid['type_infos']['levels'];
        usort($levels, function (string $a, string $b) {
            return intval($a) - intval($b);
        });

        return ['bottom_level' => end($levels), 'top_level' => reset($levels)];
    }
}
