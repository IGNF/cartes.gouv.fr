<?php

declare(strict_types=1);

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\StaticFileTypes;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Uid\Uuid;

/** Fichiers de style SLD d’un flux WMS vecteur : un fichier statique par table. */
final readonly class WmsVectorStyleFileService
{
    public function __construct(
        private StaticApiService $staticApiService,
        private ConfigurationApiService $configurationApiService,
        private Filesystem $filesystem,
        private LoggerInterface $logger,
        #[Autowire(param: 'style_files_path')]
        private string $styleFilesPath,
    ) {
    }

    public static function name(string $configurationId, string $tableName): string
    {
        return sprintf('config_%s_style_wmsv_%s', $configurationId, $tableName);
    }

    /**
     * Dépose les fichiers ; en cas d’échec, ceux déjà déposés sont supprimés.
     *
     * @param array<string, UploadedFile> $files fichier par nom de table
     *
     * @return array<string, string> identifiant du fichier statique par nom de table
     */
    public function upload(string $datastoreId, array $files, string $configurationId): array
    {
        $staticIds = [];
        $tmpDirs = [];
        try {
            foreach ($files as $tableName => $file) {
                $tmpDirs[] = $tmpDir = $this->styleFilesPath.'/'.Uuid::v4();
                $file = $file->move($tmpDir, $file->getClientOriginalName());
                $staticIds[$tableName] = $this->staticApiService->add(
                    $datastoreId,
                    $file->getPathname(),
                    // une clé « 2024 » devient un entier en PHP
                    self::name($configurationId, (string) $tableName),
                    StaticFileTypes::GEOSERVER_STYLE,
                )['_id'];
            }
        } catch (\Throwable $th) {
            $this->removeQuietly($datastoreId, $staticIds);
            throw $th;
        } finally {
            $this->filesystem->remove($tmpDirs);
        }

        return $staticIds;
    }

    /**
     * Renomme d’après la configuration les fichiers déposés sous un nom temporaire à la publication.
     *
     * @param array<string, string> $staticIds identifiant du fichier statique par nom de table
     */
    public function rename(string $datastoreId, array $staticIds, string $configurationId): void
    {
        foreach ($staticIds as $tableName => $staticId) {
            $this->staticApiService->modifyInfo($datastoreId, $staticId, ['name' => self::name($configurationId, (string) $tableName)])->await();
        }
    }

    /**
     * Après un échec de modification : supprime ceux de ces fichiers que la configuration relue n’utilise plus, qu’elle ait été enregistrée ou non.
     *
     * @param array<string> $staticIds fichiers enregistrés et déposés
     * @param list<string>  $fields    champs des tables qui référencent un fichier (`style`, `ftl`)
     */
    public function removeUnused(string $datastoreId, string $configurationId, array $staticIds, array $fields = ['style']): void
    {
        try {
            $relations = $this->configurationApiService->get($datastoreId, $configurationId)->array()['type_infos']['used_data'][0]['relations'] ?? [];
            $used = array_merge(...array_map(fn (string $field) => array_column($relations, $field), $fields));
        } catch (\Throwable $e) {
            // configuration illisible : rien n’est supprimé, un fichier peut être encore utilisé
            $this->logger->warning('{class}: Failed to read configuration {configurationId} after a failed edit: {error}', [
                'class' => self::class,
                'configurationId' => $configurationId,
                'exception' => $e,
                'error' => $e->getMessage(),
            ]);

            return;
        }

        $this->removeQuietly($datastoreId, array_diff($staticIds, $used));
    }

    /**
     * Suppression sans lever d’erreur (échec journalisé) : un fichier restant n’est qu’un orphelin.
     *
     * @param array<string> $staticIds
     */
    public function removeQuietly(string $datastoreId, array $staticIds): void
    {
        foreach ($staticIds as $staticId) {
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
}
