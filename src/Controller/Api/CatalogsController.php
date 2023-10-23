<?php

namespace App\Controller\Api;

use App\Services\EntrepotApiService;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;


#[Route(
    '/api/catalogs',
    name: 'cartesgouvfr_api_catalogs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class CatalogsController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService,
    ) {
    }

    #[Route('/communities', name: 'communities', methods: ['GET'])]
    public function communities(Request $request): JsonResponse
    {
        $params = ['page' => 1, 'limit' => 10];
        try {
            $queryParams = [];
            foreach($params as $name => $defValue) {
                $filtered = filter_var($request->get($name, $defValue), FILTER_VALIDATE_INT);
                if ($filtered === false) {
                    throw new \Exception("Le paramêtre $name n\'est pas valide", Response::HTTP_BAD_REQUEST);
                }
                $queryParams[$name] = $filtered;
            }
            $response = $this->entrepotApiService->catalogs->getPublicCommunities($queryParams) ;   
            return $this->json($response);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            return $this->json(['message' => $ex->getMessage()], $ex->getCode());
        }
    }
}
