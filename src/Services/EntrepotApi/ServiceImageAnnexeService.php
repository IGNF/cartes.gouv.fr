<?php

declare(strict_types=1);

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\CommonTags;
use App\Exception\AppException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Uid\Uuid;

/**
 * Vignette et logo d’attribution d’un flux, déposés en annexes de l’entrepôt (voir docs/developer/entrepot/annexes/README.md).
 * Les fichiers reçus sont déjà validés (taille, type) par le contrôleur.
 */
class ServiceImageAnnexeService
{
    public const THUMBNAIL_TYPE = 'service-thumbnail';
    public const ATTRIBUTION_LOGO_TYPE = 'attribution-logo';
    public const MAX_SIZE = '5M';
    public const MIME_TYPES = ['image/jpeg', 'image/png'];

    private const EXTENSIONS = ['image/jpeg' => 'jpg', 'image/png' => 'png'];

    public function __construct(
        private readonly AnnexeApiService $annexeApiService,
    ) {
    }

    /** @return string URL publique de la vignette */
    public function addThumbnail(string $datastoreId, string $datasheetName, UploadedFile $file): string
    {
        $annexe = $this->annexeApiService->add($datastoreId, $file->getRealPath(), ['/thumbnail/'.Uuid::v4().'.'.$this->extension($file)], [
            CommonTags::DATASHEET_NAME.'='.$datasheetName,
            'type='.self::THUMBNAIL_TYPE,
        ]);

        return $this->annexeApiService->getAbsoluteUrl($datastoreId, $annexe);
    }

    /**
     * @return array{url: string, width: int, height: int, format: string} objet `attribution.logo` attendu par l’Entrepôt
     */
    public function addAttributionLogo(string $datastoreId, string $datasheetName, UploadedFile $file): array
    {
        // lu avant le dépôt : AnnexeApiService::add supprime le fichier temporaire
        $size = getimagesize($file->getRealPath());
        if (false === $size) {
            throw new AppException('Le logo n’est pas une image lisible', Response::HTTP_BAD_REQUEST);
        }

        $annexe = $this->annexeApiService->add($datastoreId, $file->getRealPath(), ['/attribution-logo/'.Uuid::v4().'.'.$this->extension($file)], [
            CommonTags::DATASHEET_NAME.'='.$datasheetName,
            'type='.self::ATTRIBUTION_LOGO_TYPE,
        ]);

        return [
            'url' => $this->annexeApiService->getAbsoluteUrl($datastoreId, $annexe),
            'width' => $size[0],
            'height' => $size[1],
            'format' => $size['mime'],
        ];
    }

    /**
     * Supprime les annexes vignette et logo référencées par une configuration.
     *
     * @param array<mixed> $configuration
     */
    public function removeServiceImages(string $datastoreId, array $configuration): void
    {
        foreach ([$configuration['extra']['_search']['url_vignette'] ?? null, $configuration['attribution']['logo']['url'] ?? null] as $url) {
            if (is_string($url)) {
                $this->removeByUrl($datastoreId, $url);
            }
        }
    }

    public function removeByUrl(string $datastoreId, string $url): void
    {
        $baseUrl = $this->annexeApiService->getBaseUrl($datastoreId);
        if (!str_starts_with($url, $baseUrl)) {
            return;
        }
        $path = substr($url, strlen($baseUrl));
        // l’URL vient d’une configuration : seules les annexes déposées par ce service sont supprimées
        if (1 !== preg_match('#^/(thumbnail|attribution-logo)/[0-9a-f-]{36}\.(jpg|png)$#', $path)) {
            return;
        }
        foreach ($this->annexeApiService->getAll($datastoreId, null, $path)->resolve() as $annexe) {
            $labels = $annexe['labels'] ?? [];
            if (($annexe['paths'][0] ?? null) !== $path
                || [] === array_intersect(['type='.self::THUMBNAIL_TYPE, 'type='.self::ATTRIBUTION_LOGO_TYPE], $labels)) {
                continue;
            }
            $this->annexeApiService->remove($datastoreId, $annexe['_id'])->await();
        }
    }

    private function extension(UploadedFile $file): string
    {
        return self::EXTENSIONS[$file->getMimeType()] ?? throw new AppException('Format d’image non pris en charge', Response::HTTP_BAD_REQUEST);
    }
}
