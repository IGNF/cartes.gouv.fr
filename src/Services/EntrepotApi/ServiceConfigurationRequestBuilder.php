<?php

declare(strict_types=1);

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Constants\EntrepotApi\ZoomLevels;
use App\Dto\Services\Form\ServiceAttributionFormDTO;
use App\Dto\Services\Form\ServiceEditFormDTO;
use App\Dto\Services\Form\ServicePublishFormDTO;
use App\Dto\Services\Form\WfsTableEditFormDTO;
use App\Dto\Services\Form\WfsTableFormDTO;

/** Corps des requêtes de configuration Entrepôt des formulaires de flux (publication, et tables WFS de la modification). */
class ServiceConfigurationRequestBuilder
{
    /**
     * La vignette n’en fait pas partie : l’Entrepôt ignore `extra` à la création, voir buildThumbnailExtra().
     *
     * @param array<mixed>                                                     $typeInfos      `type_infos` du flux (buildTypeInfos)
     * @param array<mixed>                                                     $configMetadata liens `metadata` vers la fiche (CartesServiceApiService::getNewConfigMetadata)
     * @param array{url: string, width: int, height: int, format: string}|null $logo           logo d’attribution déjà déposé en annexe
     *
     * @return array<mixed>
     */
    public function build(ServicePublishFormDTO $dto, array $typeInfos, array $configMetadata, ?array $logo): array
    {
        $body = [
            'name' => $dto->title,
            'layer_name' => $dto->technical_name,
            'type' => $dto->type,
            'type_infos' => $typeInfos,
            'metadata' => $configMetadata,
        ];

        if ($dto->attribution instanceof ServiceAttributionFormDTO) {
            $body['attribution'] = self::buildAttribution($dto->attribution, $logo);
        }

        return $body;
    }

    /**
     * Corps `attribution` d’une configuration, à la publication comme à la modification.
     *
     * @param array{url: string, width: int, height: int, format: string}|null $logo logo déjà déposé en annexe, ou gardé
     *
     * @return array<string, mixed>
     */
    public static function buildAttribution(ServiceAttributionFormDTO $attribution, ?array $logo): array
    {
        $body = ['title' => $attribution->title, 'url' => $attribution->url];
        if (null !== $logo) {
            $body['logo'] = $logo;
        }

        return $body;
    }

    /**
     * `type_infos` d’un flux, à la publication comme à la modification : tables en WFS ; titre, description et thématiques ailleurs, plus les tables, leurs styles et leurs infobulles en WMS vecteur.
     *
     * @param array<mixed>          $base     `used_data` (et `styles`) à la publication, `type_infos` de la configuration à la modification
     * @param array<string, string> $styleIds WMS vecteur : fichier de style par table cochée
     * @param array<string, string> $ftlIds   WMS vecteur : modèle d’infobulle des tables qui en ont un
     *
     * @return array<mixed>
     */
    public static function buildTypeInfos(string $type, ServicePublishFormDTO|ServiceEditFormDTO $dto, array $base, array $styleIds = [], array $ftlIds = []): array
    {
        if (ConfigurationTypes::WFS === $type) {
            $base['used_data'][0]['relations'] = self::buildWfsRelations($dto->tables);

            return $base;
        }

        $base['title'] = $dto->title;
        $base['abstract'] = $dto->description;
        $base['keywords'] = $dto->themes;
        if (ConfigurationTypes::WMSVECTOR === $type) {
            $base['used_data'][0]['relations'] = array_map(
                fn (string $tableName) => ['name' => $tableName, 'style' => $styleIds[$tableName]] + (isset($ftlIds[$tableName]) ? ['ftl' => $ftlIds[$tableName]] : []),
                $dto->selected_tables,
            );
        }

        return $base;
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
