<?php

declare(strict_types=1);

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\ZoomLevels;
use App\Dto\Services\Form\ServiceAttributionFormDTO;
use App\Dto\Services\Form\ServiceFormDTO;
use App\Dto\Services\Form\WfsTableEditFormDTO;
use App\Dto\Services\Form\WfsTableFormDTO;

/** Corps des requêtes de configuration Entrepôt des formulaires de flux (publication, et tables WFS de la modification). */
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
     * `used_data[0].relations` d’un flux WFS, à la publication comme à la modification ; un champ vide est omis.
     *
     * @param array<WfsTableFormDTO|WfsTableEditFormDTO> $tables
     *
     * @return list<array<string, mixed>>
     */
    public static function buildWfsRelations(array $tables): array
    {
        return array_values(array_map(fn (WfsTableFormDTO|WfsTableEditFormDTO $table) => array_filter([
            'native_name' => $table->native_name,
            'public_name' => $table->public_name,
            'title' => $table->title,
            'abstract' => $table->description,
            'keywords' => $table->keywords,
        ], fn ($value) => [] !== $value && '' !== $value), $tables));
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
