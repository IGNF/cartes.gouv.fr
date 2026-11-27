<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Flux sous `/services` (offre avec sa configuration), offres brutes de l’Entrepôt sous `/offerings` ; plus de route de publication par type.
 */
final class ServiceRoutesTest extends KernelTestCase
{
    private const ROUTES = [
        'cartesgouvfr_api_service_publish_service' => ['POST', '/api/datastores/{datastoreId}/services'],
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

        // anciennes routes de publication par type et anciens noms des routes d’offres
        foreach (['wfs_publish', 'wmsvector_publish', 'pyramid_raster_wms_raster_wmts_publish', 'pyramid_vector_tms_publish', 'service_get_offerings_list', 'service_get_service_stats'] as $route) {
            self::assertNull($routes->get('cartesgouvfr_api_'.$route), $route);
        }
    }
}
