<?php

namespace App\Controller\Api;

use App\Constants\UploadTypes;
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
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $content = json_decode($request->getContent(), true);
            dump($content);

            // déclaration de livraison
            // TODO : nom de la fiche de donnée, qu'est-ce qu'on fait ?
            $uploadData = [
                'name' => $content['data_technical_name'],
                'description' => $content['data_technical_name'],
                'type' => UploadTypes::VECTOR,
                'srs' => $content['data_srid'],
            ];
            $upload = $this->entrepotApiService->upload->add($datastoreId, $uploadData);

            // ajouts tags sur la livraison
            $tags = [
                'data_upload_path' => $content['data_upload_path'],
                // statut des checks et du processing intégration
            ];
            $this->entrepotApiService->upload->addTags($datastoreId, $upload['_id'], $tags);

            // attente intégration en stored_data VECTOR-DB

            $upload = $this->entrepotApiService->upload->get($datastoreId, $upload['_id']);

            return $this->json($upload);
        } catch (AppException $ex) {
            return $this->json($ex->getDetails(), $ex->getCode());
        } catch (\Exception $ex) {
            return $this->json($ex->getMessage(), $ex->getCode());
        }
    }
}
