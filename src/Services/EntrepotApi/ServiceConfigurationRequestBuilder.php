<?php

declare(strict_types=1);

namespace App\Services\EntrepotApi;

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
     * Seul un PATCH écrit `extra` (le POST et le PUT l’ignorent), en remplaçant l’objet entier : à passer par ConfigurationApiService::modify, qui fusionne.
     *
     * @return array<mixed>
     */
    public static function buildThumbnailExtra(string $thumbnailUrl): array
    {
        return ['extra' => ['_search' => ['url_vignette' => $thumbnailUrl]]];
    }
}
