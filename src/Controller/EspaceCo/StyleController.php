<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\StyleApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/style',
    name: 'cartesgouvfr_api_espaceco_style_',
    options: ['expose' => true],
)]
#[OA\Tag(name: '[espaceco] style')]
class StyleController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private StyleApiService $styleApiService,
    ) {
    }

    #[Route('/image/{name}', name: 'get_image', methods: ['GET'])]
    public function getImage(string $name, Request $request): Response
    {
        try {
            $query = $request->query->all();
            $response = $this->styleApiService->getImage($name, $query);

            return new Response($response['content'], $response['code'], $response['headers']);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
