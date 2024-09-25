<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/pyramid-raster',
    name: 'cartesgouvfr_api_pyramid_raster_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class PyramidRasterController extends ServiceController implements ApiControllerInterface
{
}
