<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Les routes génériques des flux n’existent que sous `/offerings` : les contrôleurs par type n’en héritent plus.
 */
final class ServiceRoutesTest extends KernelTestCase
{
    private const GENERIC_ROUTES = ['get_offerings_list', 'get_service', 'get_service_stats', 'unpublish_service', 'get_existing_layer_names'];

    public function testGenericServiceRoutesOnlyLiveUnderOfferings(): void
    {
        $routes = self::getContainer()->get('router')->getRouteCollection();

        foreach (self::GENERIC_ROUTES as $route) {
            $offeringsRoute = $routes->get('cartesgouvfr_api_service_'.$route);
            self::assertNotNull($offeringsRoute, $route);
            self::assertStringStartsWith('/api/datastores/{datastoreId}/offerings', $offeringsRoute->getPath());

            foreach (['wfs', 'wmsvector', 'pyramid_raster', 'pyramid_vector'] as $prefix) {
                self::assertNull($routes->get(sprintf('cartesgouvfr_api_%s_%s', $prefix, $route)), $prefix.'_'.$route);
            }
        }
    }
}
