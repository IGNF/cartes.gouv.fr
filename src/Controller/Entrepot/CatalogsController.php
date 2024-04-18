<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/catalogs',
    name: 'cartesgouvfr_api_catalogs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class CatalogsController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService,
    ) {
    }

    #[Route('/communities', name: 'communities', methods: ['GET'])]
    public function communities(): JsonResponse
    {
        try {
            $response = $this->entrepotApiService->catalogs->getAllPublicCommunities();

            return $this->json($response);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], $ex->getCode());
        }
    }
}
