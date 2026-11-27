<?php

declare(strict_types=1);

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\StaticFileTypes;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Uid\Uuid;

/** Fichier de style ROK4 d’un flux WMS raster ou WMTS : la légende de la pyramide, un fichier statique par configuration. */
final readonly class Rok4StyleFileService
{
    public function __construct(
        private StaticApiService $staticApiService,
        private Filesystem $filesystem,
        private LoggerInterface $logger,
        #[Autowire(param: 'style_files_path')]
        private string $styleFilesPath,
    ) {
    }

    /**
     * @param string $configType « wmsr » ou « wmts »
     */
    public static function name(string $configurationId, string $configType): string
    {
        return sprintf('config_%s_style_%s', $configurationId, $configType);
    }

    /**
     * Dépose le style sous un nom temporaire : l’identifiant de la configuration n’existe pas encore (voir rename()).
     *
     * @param array<mixed>                                   $pyramid
     * @param array{bottom_level: string, top_level: string} $zoomLevels
     *
     * @return string identifiant du fichier statique
     */
    public function upload(string $datastoreId, array $pyramid, string $configType, array $zoomLevels): string
    {
        $legend = [
            'format' => 'image/png',
            'width' => 20,
            'height' => 20,
            'min_scale_denominator' => intval($zoomLevels['top_level']),
            'max_scale_denominator' => intval($zoomLevels['bottom_level']),
        ];
        $legendUrl = $pyramid['extra']['legend']['url'] ?? null;
        if (null !== $legendUrl) {
            $legend['url'] = $legendUrl;
        }

        $rok4Style = [
            'identifier' => $pyramid['name'],
            'title' => $pyramid['name'],
            'legend' => $legend,
        ];

        $styleFileDir = $this->styleFilesPath.DIRECTORY_SEPARATOR.Uuid::v4();
        $styleFilePath = $styleFileDir.DIRECTORY_SEPARATOR.'rok4style_'.Uuid::v4().'.json';

        $this->filesystem->mkdir($styleFileDir);
        try {
            $this->filesystem->dumpFile($styleFilePath, json_encode($rok4Style, JSON_THROW_ON_ERROR));

            return $this->staticApiService->add($datastoreId, $styleFilePath, self::name('tmp_'.Uuid::v4(), $configType), StaticFileTypes::ROK4_STYLE)['_id'];
        } finally {
            $this->filesystem->remove($styleFileDir);
        }
    }

    public function rename(string $datastoreId, string $staticId, string $configurationId, string $configType): void
    {
        $this->staticApiService->modifyInfo($datastoreId, $staticId, ['name' => self::name($configurationId, $configType)])->await();
    }

    /**
     * Suppression sans lever d’erreur (échec journalisé) : un fichier restant n’est qu’un orphelin.
     */
    public function removeQuietly(string $datastoreId, string $staticId): void
    {
        try {
            $this->staticApiService->delete($datastoreId, $staticId)->await();
        } catch (\Throwable $e) {
            $this->logger->warning('{class}: Failed to remove style file {staticId}: {error}', [
                'class' => self::class,
                'staticId' => $staticId,
                'exception' => $e,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
