<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/community',
    name: 'cartesgouvfr_api_espaceco_community_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class CommunityController extends AbstractController implements ApiControllerInterface
{
}
