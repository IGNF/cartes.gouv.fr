<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CswMetadataHelper;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\MetadataApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route(
    '/api/datastores/{datastoreId}/annexe',
    name: 'cartesgouvfr_api_annexe_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class AnnexeController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private AnnexeApiService $annexeApiService,
        private DatastoreApiService $datastoreApiService,
        private MetadataApiService $metadataApiService,
        private CartesMetadataApiService $cartesMetadataApiService,
        private CswMetadataHelper $metadataHelper,
        private ParameterBagInterface $parameterBag,
    ) {
    }

    /**
     * @param array<string>|null $labels
     */
    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getAnnexeList(
        string $datastoreId,
        #[MapQueryParameter] ?string $path,
        #[MapQueryParameter] ?array $labels,
        #[MapQueryParameter('mime_type')] ?string $mimeType,
    ): JsonResponse {
        try {
            $annexeList = $this->annexeApiService->getAll($datastoreId, $mimeType, $path, $labels);

            return $this->json($annexeList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{annexeId}', name: 'modify', methods: ['PATCH'])]
    public function modify(string $datastoreId, string $annexeId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            return $this->json(
                $this->annexeApiService->modify(
                    $datastoreId,
                    $annexeId,
                    $data['paths'] ?? null,
                    $data['labels'] ?? null,
                    $data['published'] ?? null
                )
            );
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{annexeId}', name: 'replace_file', methods: ['POST'])]
    public function replaceFile(string $datastoreId, string $annexeId, Request $request): JsonResponse
    {
        try {
            $file = $request->files->get('file');

            return $this->json(
                $this->annexeApiService->replaceFile($datastoreId, $annexeId, $file->getRealPath())
            );
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/thumbnail_add', name: 'thumbnail_add', methods: ['POST'])]
    public function addThumbnail(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $datastore = $this->datastoreApiService->get($datastoreId);
            $datasheetName = $request->request->get('datasheetName');
            $annexeUrl = $this->parameterBag->get('annexes_url');

            $uuid = Uuid::v4();

            $file = $request->files->get('file');
            $extension = $file->getClientOriginalExtension();
            $path = join('/', ['thumbnail', "$uuid.$extension"]);

            $labels = [
                CommonTags::DATASHEET_NAME."=$datasheetName",
                'type=thumbnail',
            ];

            // On regarde s'il existe deja une vignette
            $annexes = $this->annexeApiService->getAll($datastoreId, null, null, $labels);

            if (count($annexes)) {  // Elle existe, on la supprime sinon le path ne change pas
                $this->annexeApiService->remove($datastoreId, $annexes[0]['_id']);
            }

            $annexe = $this->annexeApiService->add($datastoreId, $file->getRealPath(), [$path], $labels);
            $annexe['url'] = $annexeUrl.'/'.$datastore['technical_name'].$annexe['paths'][0];

            // Creation ou mise a jour des métadonnées
            $metadata = $this->cartesMetadataApiService->getMetadataByDatasheetName($datastoreId, $datasheetName);
            if (is_null($metadata)) {
                return new JsonResponse($annexe);
            }

            $xmlFileContent = $this->metadataApiService->downloadFile($datastoreId, $metadata['_id']);
            $cswMetadata = $this->metadataHelper->fromXml($xmlFileContent);
            $cswMetadata->thumbnailUrl = $annexe['url'];

            $xmlFilePath = $this->metadataHelper->saveToFile($cswMetadata);
            $this->metadataApiService->replaceFile($datastoreId, $metadata['_id'], $xmlFilePath);

            return new JsonResponse($annexe);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/thumbnail_delete/{datasheetName}/{annexeId}', name: 'thumbnail_delete', methods: ['DELETE'])]
    public function deleteThumbnail(string $datastoreId, string $datasheetName, string $annexeId): JsonResponse
    {
        $response = $this->deleteAnnexe($datastoreId, $annexeId);

        // Mise a jour des métadonnées
        $metadata = $this->cartesMetadataApiService->getMetadataByDatasheetName($datastoreId, $datasheetName);
        if (is_null($metadata)) {
            return $response;
        }

        $xmlFileContent = $this->metadataApiService->downloadFile($datastoreId, $metadata['_id']);
        $cswMetadata = $this->metadataHelper->fromXml($xmlFileContent);
        $cswMetadata->thumbnailUrl = null;

        $xmlFilePath = $this->metadataHelper->saveToFile($cswMetadata);
        $this->metadataApiService->replaceFile($datastoreId, $metadata['_id'], $xmlFilePath);

        return $response;
    }

    #[Route('/{annexeId}', name: 'delete', methods: ['DELETE'])]
    public function deleteAnnexe(string $datastoreId, string $annexeId): JsonResponse
    {
        try {
            $this->annexeApiService->remove($datastoreId, $annexeId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
