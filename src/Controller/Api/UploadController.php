<?php

namespace App\Controller\Api;

use App\Exception\AppException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastore/{datastoreId}/upload',
    name: 'cartesgouvfr_api_upload_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class UploadController extends AbstractController
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(Request $request): JsonResponse
    {
        try {
            $content = json_decode($request->getContent(), true);
            dump($content);

            return $this->json($content);
        } catch (AppException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        } catch (\Exception $ex) {
            return $this->json($ex->getMessage(), $ex->getCode());
        }
    }
}
