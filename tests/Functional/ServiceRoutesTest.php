<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Flux sous `/services` (offre avec sa configuration), offres brutes de l’Entrepôt sous `/offerings` ; aucune route générique dans les contrôleurs par type.
 */
final class ServiceRoutesTest extends KernelTestCase
{
    private const ROUTES = [
        'cartesgouvfr_api_service_get_service' => ['GET', '/api/datastores/{datastoreId}/services/{offeringId}'],
        'cartesgouvfr_api_service_edit_service' => ['POST', '/api/datastores/{datastoreId}/services/{offeringId}'],
        'cartesgouvfr_api_service_unpublish_service' => ['DELETE', '/api/datastores/{datastoreId}/services/{offeringId}'],
        'cartesgouvfr_api_service_get_existing_layer_names' => ['GET', '/api/datastores/{datastoreId}/services/layernames'],
        'cartesgouvfr_api_offering_list' => ['GET', '/api/datastores/{datastoreId}/offerings'],
        'cartesgouvfr_api_offering_stats' => ['GET', '/api/datastores/{datastoreId}/offerings/{offeringId}/stats'],
    ];

    public function testServiceAndOfferingRoutes(): void
    {
        $routes = self::getContainer()->get('router')->getRouteCollection();

        foreach (self::ROUTES as $name => [$method, $path]) {
            $route = $routes->get($name);
            self::assertNotNull($route, $name);
            self::assertSame($path, $route->getPath(), $name);
            self::assertSame([$method], $route->getMethods(), $name);
        }

        foreach (['wfs', 'wmsvector', 'pyramid_raster', 'pyramid_vector'] as $prefix) {
            foreach (['get_service', 'unpublish_service', 'get_existing_layer_names', 'get_offerings_list'] as $route) {
                self::assertNull($routes->get(sprintf('cartesgouvfr_api_%s_%s', $prefix, $route)), $prefix.'_'.$route);
            }
        }
    }
}
