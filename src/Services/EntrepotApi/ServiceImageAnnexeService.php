<?php

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\CommonTags;
use App\Exception\CartesApiException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Uid\Uuid;

/**
 * Vignette et logo d’attribution d’un flux, déposés en annexes de l’entrepôt (voir docs/developer/entrepot/annexes/README.md).
 */
class ServiceImageAnnexeService
{
    public const THUMBNAIL_TYPE = 'service-thumbnail';
    public const ATTRIBUTION_LOGO_TYPE = 'attribution-logo';
    public const MAX_SIZE_MO = 5;
    private const ALLOWED_MIME_TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png'];

    public function __construct(
        private AnnexeApiService $annexeApiService,
    ) {
    }

    /** @return string URL publique de la vignette */
    public function addThumbnail(string $datastoreId, string $datasheetName, UploadedFile $file): string
    {
        $extension = $this->checkImage($file, 'La vignette');
        $annexe = $this->annexeApiService->add($datastoreId, $file->getRealPath(), ['/thumbnail/'.Uuid::v4().'.'.$extension], [
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
        $extension = $this->checkImage($file, 'Le logo');
        $size = getimagesize($file->getRealPath());
        if (false === $size) {
            throw new CartesApiException('Le logo n’est pas une image lisible', Response::HTTP_BAD_REQUEST);
        }

        $annexe = $this->annexeApiService->add($datastoreId, $file->getRealPath(), ['/attribution-logo/'.Uuid::v4().'.'.$extension], [
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
     * Supprime les annexes vignette et logo référencées par une configuration (suppression ou remplacement d’un flux).
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
        // L’URL vient d’une configuration : on ne supprime que les annexes que ce service a créées.
        if (!preg_match('#^/(thumbnail|attribution-logo)/[0-9a-f-]{36}\.(jpg|png)$#', $path)) {
            return;
        }
        foreach ($this->annexeApiService->getAll($datastoreId, null, $path)->resolve() as $annexe) {
            $labels = $annexe['labels'] ?? [];
            if (($annexe['paths'][0] ?? null) !== $path
                || !array_intersect(['type='.self::THUMBNAIL_TYPE, 'type='.self::ATTRIBUTION_LOGO_TYPE], $labels)) {
                continue;
            }
            $this->annexeApiService->remove($datastoreId, $annexe['_id'])->await();
        }
    }

    /** @return string extension normalisée (jpg ou png) */
    private function checkImage(UploadedFile $file, string $label): string
    {
        if ($file->getSize() > self::MAX_SIZE_MO * 1024 * 1024) {
            throw new CartesApiException(sprintf('%s dépasse %d Mo', $label, self::MAX_SIZE_MO), Response::HTTP_BAD_REQUEST);
        }
        $mimeType = $file->getMimeType();
        if (null === $mimeType || !array_key_exists($mimeType, self::ALLOWED_MIME_TYPES)) {
            throw new CartesApiException(sprintf('%s doit être au format jpg ou png', $label), Response::HTTP_BAD_REQUEST);
        }

        return self::ALLOWED_MIME_TYPES[$mimeType];
    }
}
