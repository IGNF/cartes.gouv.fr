<?php

declare(strict_types=1);

namespace App\Services\EntrepotApi;

use App\Constants\EntrepotApi\StaticFileTypes;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Uid\Uuid;

/**
 * Infobulles (GetFeatureInfo) d’un flux WMS vecteur : un modèle FreeMarker (static GEOSERVER-FTL) par table, généré par cartes.gouv.fr.
 * Seuls les modèles qu’on sait régénérer à l’identique sont relus ; les autres sont des modèles personnalisés, jamais modifiés.
 */
final readonly class WmsVectorFeatureInfoService
{
    public const FORMAT_LIST = 'list';
    public const FORMAT_TABLE = 'table';
    public const FORMATS = [self::FORMAT_LIST, self::FORMAT_TABLE];

    // guillemet interdit dans une chaîne brute FreeMarker r"…", caractères de contrôle refusés par prudence
    public const NAME_PATTERN = '/^[^"\p{Cc}]+\z/u';

    private const HEADER_PATTERN = '/^<#-- cartes\.gouv\.fr featureinfo v1 format=(list|table) -->\n/';

    public function __construct(
        private StaticApiService $staticApiService,
        private Filesystem $filesystem,
        #[Autowire(param: 'style_files_path')]
        private string $tmpPath,
    ) {
    }

    public static function name(string $configurationId, string $tableName): string
    {
        return sprintf('config_%s_featureinfo_wmsv_%s', $configurationId, $tableName);
    }

    /**
     * Modèle d’une table ; les noms passent en chaînes brutes FreeMarker (r"…") : un nom de colonne « ${…} » n’est jamais évalué.
     *
     * @param list<string> $attributes
     *
     * @throws \InvalidArgumentException format inconnu, aucun attribut ou nom invalide
     */
    public static function build(string $tableName, string $format, array $attributes): string
    {
        if (!in_array($format, self::FORMATS, true) || [] === $attributes) {
            throw new \InvalidArgumentException('Format ou attributs d’infobulle invalides');
        }
        foreach ([$tableName, ...$attributes] as $name) {
            if (1 !== preg_match(self::NAME_PATTERN, $name)) {
                throw new \InvalidArgumentException(sprintf('Nom invalide dans une infobulle : %s', $name));
            }
        }

        $raw = fn (string $name): string => sprintf('${r"%s"}', $name);
        $value = fn (string $name): string => sprintf('${(feature[r"%s"].value)!""}', $name);

        $ftl = sprintf("<#-- cartes.gouv.fr featureinfo v1 format=%s -->\n<h4>%s</h4>\n", $format, $raw($tableName));
        if (self::FORMAT_LIST === $format) {
            $items = implode('', array_map(fn (string $name) => sprintf("  <li><strong>%s</strong> : %s</li>\n", $raw($name), $value($name)), $attributes));

            return $ftl."<#list features as feature>\n<ul>\n".$items."</ul>\n</#list>\n";
        }

        $headers = implode('', array_map(fn (string $name) => sprintf('<th>%s</th>', $raw($name)), $attributes));
        $cells = implode('', array_map(fn (string $name) => sprintf('<td>%s</td>', $value($name)), $attributes));

        return $ftl."<table>\n  <tr>$headers</tr>\n<#list features as feature>\n  <tr>$cells</tr>\n</#list>\n</table>\n";
    }

    /**
     * Réglages d’un modèle généré par cartes.gouv.fr, null pour un modèle personnalisé (même avec notre en-tête, s’il a été retouché).
     *
     * @return array{format: string, attributes: list<string>}|null
     */
    public static function parse(string $content, string $tableName): ?array
    {
        if (1 !== preg_match(self::HEADER_PATTERN, $content, $header)) {
            return null;
        }
        preg_match_all('/feature\[r"([^"]*)"\]/', $content, $matches);
        $attributes = array_values(array_unique($matches[1]));

        try {
            $rebuilt = self::build($tableName, $header[1], $attributes);
        } catch (\InvalidArgumentException) {
            return null;
        }

        return $rebuilt === $content ? ['format' => $header[1], 'attributes' => $attributes] : null;
    }

    /**
     * Dépose un modèle par table ; en cas d’échec, ceux déjà déposés sont supprimés.
     *
     * @param array<string, list<string>> $attributesByTable attributs affichés par nom de table
     *
     * @return array<string, string> identifiant du static par nom de table
     */
    public function upload(string $datastoreId, string $format, array $attributesByTable, string $configurationId): array
    {
        $staticIds = [];
        $tmpDir = $this->tmpPath.'/'.Uuid::v4();
        try {
            foreach ($attributesByTable as $tableName => $attributes) {
                // une clé « 2024 » devient un entier en PHP
                $tableName = (string) $tableName;
                $path = $tmpDir.'/'.Uuid::v4().'.ftl';
                $this->filesystem->dumpFile($path, self::build($tableName, $format, $attributes));
                $staticIds[$tableName] = $this->staticApiService->add($datastoreId, $path, self::name($configurationId, $tableName), StaticFileTypes::GEOSERVER_FTL)['_id'];
            }
        } catch (\Throwable $th) {
            foreach ($staticIds as $staticId) {
                try {
                    $this->staticApiService->delete($datastoreId, $staticId)->await();
                } catch (\Throwable) {
                    // orphelin sans conséquence : l’erreur d’origine reste celle renvoyée
                }
            }
            throw $th;
        } finally {
            $this->filesystem->remove($tmpDir);
        }

        return $staticIds;
    }

    /**
     * Renomme d’après la configuration les modèles déposés sous un nom temporaire à la publication.
     *
     * @param array<string, string> $staticIds identifiant du static par nom de table
     */
    public function rename(string $datastoreId, array $staticIds, string $configurationId): void
    {
        foreach ($staticIds as $tableName => $staticId) {
            $this->staticApiService->modifyInfo($datastoreId, $staticId, ['name' => self::name($configurationId, (string) $tableName)])->await();
        }
    }

    /**
     * Relit les modèles en parallèle ; une erreur de lecture est levée.
     *
     * @param array<string, string> $ftlIds identifiant du static par nom de table
     *
     * @return array<string, array{format: string, attributes: list<string>}|null> réglages par table, null pour un modèle personnalisé
     */
    public function read(string $datastoreId, array $ftlIds): array
    {
        $pending = array_map(fn (string $staticId) => $this->staticApiService->downloadFile($datastoreId, $staticId), $ftlIds);

        $settings = [];
        foreach ($pending as $tableName => $promise) {
            $settings[(string) $tableName] = self::parse($promise->text(), (string) $tableName);
        }

        return $settings;
    }
}
