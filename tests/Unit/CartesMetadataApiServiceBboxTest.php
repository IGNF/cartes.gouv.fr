<?php

namespace App\Tests\Unit;

use App\Services\EntrepotApi\CartesMetadataApiService;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class CartesMetadataApiServiceBboxTest extends TestCase
{
    /**
     * @param array<mixed>                                                     $features
     * @param array{west: float, south: float, east: float, north: float}|null $expected
     */
    #[DataProvider('features')]
    public function testComputesBboxFromFeatures(array $features, ?array $expected): void
    {
        // méthode privée appelée par réflexion : elle disparaît avec la refonte de la publication (#852)
        $service = (new \ReflectionClass(CartesMetadataApiService::class))->newInstanceWithoutConstructor();
        $method = new \ReflectionMethod(CartesMetadataApiService::class, 'getBboxFromFeatures');

        self::assertSame($expected, $method->invoke($service, $features));
    }

    /**
     * @return iterable<string, array{array<mixed>, array{west: float, south: float, east: float, north: float}|null}>
     */
    public static function features(): iterable
    {
        yield 'Guadeloupe, longitudes négatives' => [
            [self::polygon([[-61.8, 15.8], [-61.0, 15.8], [-61.0, 16.5], [-61.8, 16.5], [-61.8, 15.8]])],
            ['west' => -61.8, 'south' => 15.8, 'east' => -61.0, 'north' => 16.5],
        ];

        yield 'La Réunion, latitudes négatives' => [
            [self::polygon([[55.2, -21.4], [55.8, -21.4], [55.8, -20.9], [55.2, -20.9], [55.2, -21.4]])],
            ['west' => 55.2, 'south' => -21.4, 'east' => 55.8, 'north' => -20.9],
        ];

        yield 'MultiPolygon et plusieurs emprises' => [
            [
                [
                    'type' => 'Feature',
                    'geometry' => [
                        'type' => 'MultiPolygon',
                        'coordinates' => [
                            [[[-5.0, 42.0], [8.0, 42.0], [8.0, 51.0], [-5.0, 42.0]]],
                            [[[-61.8, 15.8], [-61.0, 16.5], [-61.8, 15.8]]],
                        ],
                    ],
                ],
                self::polygon([[55.2, -21.4], [55.8, -20.9], [55.2, -21.4]]),
            ],
            ['west' => -61.8, 'south' => -21.4, 'east' => 55.8, 'north' => 51.0],
        ];

        yield 'aucune emprise' => [[], null];

        yield 'emprise sans géométrie' => [[['type' => 'Feature']], null];
    }

    /**
     * @param list<array{float, float}> $ring
     *
     * @return array<mixed>
     */
    private static function polygon(array $ring): array
    {
        return ['type' => 'Feature', 'geometry' => ['type' => 'Polygon', 'coordinates' => [$ring]]];
    }
}
