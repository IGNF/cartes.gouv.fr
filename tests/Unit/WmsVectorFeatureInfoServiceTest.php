<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Services\EntrepotApi\WmsVectorFeatureInfoService;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class WmsVectorFeatureInfoServiceTest extends TestCase
{
    public function testListTemplate(): void
    {
        $expected = <<<'FTL'
            <#-- cartes.gouv.fr featureinfo v1 format=list -->
            <h4>${r"cours_d_eau"}</h4>
            <#list features as feature>
            <ul>
              <li><strong>${r"importance"}</strong> : ${(feature[r"importance"].value)!""}</li>
              <li><strong>${r"toponyme"}</strong> : ${(feature[r"toponyme"].value)!""}</li>
            </ul>
            </#list>

            FTL;

        self::assertSame($expected, WmsVectorFeatureInfoService::build('cours_d_eau', 'list', ['importance', 'toponyme']));
    }

    public function testTableTemplate(): void
    {
        $expected = <<<'FTL'
            <#-- cartes.gouv.fr featureinfo v1 format=table -->
            <h4>${r"cours_d_eau"}</h4>
            <table>
              <tr><th>${r"importance"}</th><th>${r"toponyme"}</th></tr>
            <#list features as feature>
              <tr><td>${(feature[r"importance"].value)!""}</td><td>${(feature[r"toponyme"].value)!""}</td></tr>
            </#list>
            </table>

            FTL;

        self::assertSame($expected, WmsVectorFeatureInfoService::build('cours_d_eau', 'table', ['importance', 'toponyme']));
    }

    public function testInterpolationInANameStaysRawText(): void
    {
        $ftl = WmsVectorFeatureInfoService::build('${7*7}', 'list', ['#{7*7}']);

        self::assertStringContainsString('<h4>${r"${7*7}"}</h4>', $ftl);
        self::assertStringContainsString('${(feature[r"#{7*7}"].value)!""}', $ftl);
        self::assertSame(['format' => 'list', 'attributes' => ['#{7*7}']], WmsVectorFeatureInfoService::parse($ftl, '${7*7}'));
    }

    /**
     * @param list<string> $attributes
     */
    #[DataProvider('invalidInputs')]
    public function testInvalidInputIsRejected(string $tableName, string $format, array $attributes): void
    {
        $this->expectException(\InvalidArgumentException::class);
        WmsVectorFeatureInfoService::build($tableName, $format, $attributes);
    }

    /**
     * @return iterable<string, array{string, string, list<string>}>
     */
    public static function invalidInputs(): iterable
    {
        yield 'guillemet dans un attribut' => ['t', 'list', ['a"].value}${7*7}']];
        yield 'guillemet dans la table' => ['t"', 'list', ['a']];
        yield 'retour à la ligne' => ["t\n", 'list', ['a']];
        yield 'nom vide' => ['t', 'list', ['']];
        yield 'aucun attribut' => ['t', 'list', []];
        yield 'format inconnu' => ['t', 'json', ['a']];
    }

    #[DataProvider('formats')]
    public function testGeneratedTemplateIsParsedBack(string $format): void
    {
        $ftl = WmsVectorFeatureInfoService::build('plan_d_eau', $format, ['nature', 'toponyme']);

        self::assertSame(['format' => $format, 'attributes' => ['nature', 'toponyme']], WmsVectorFeatureInfoService::parse($ftl, 'plan_d_eau'));
    }

    /**
     * @return iterable<array{string}>
     */
    public static function formats(): iterable
    {
        yield ['list'];
        yield ['table'];
    }

    public function testCustomTemplatesAreNotParsed(): void
    {
        $generated = WmsVectorFeatureInfoService::build('plan_d_eau', 'list', ['nature']);

        self::assertNull(WmsVectorFeatureInfoService::parse('<#list features as feature>${feature.nature.value}</#list>', 'plan_d_eau'), 'sans en-tête');
        self::assertNull(WmsVectorFeatureInfoService::parse(str_replace('<ul>', '<ul class="x">', $generated), 'plan_d_eau'), 'retouché');
        self::assertNull(WmsVectorFeatureInfoService::parse($generated, 'autre_table'), 'autre table');
    }
}
