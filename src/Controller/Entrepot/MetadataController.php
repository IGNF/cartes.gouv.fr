<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CswMetadataHelper;
use App\Services\EntrepotApi\MetadataApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route(
    '/api/datastores/{datastoreId}/metadata',
    name: 'cartesgouvfr_api_metadata_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class MetadataController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private MetadataApiService $metadataApiService,
        private CswMetadataHelper $cswMetadataHelper,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getList(
        string $datastoreId,
        Request $request,
    ): JsonResponse {
        try {
            $query = $request->query->all();

            $metadataList = $this->metadataApiService->getAll($datastoreId, $query);

            return $this->json($metadataList);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $metadataArray = json_decode($request->getContent(), true);
            $datasheetName = $request->query->get(CommonTags::DATASHEET_NAME, null);

            $cswMetadata = $this->cswMetadataHelper->fromArray($metadataArray);
            $filePath = $this->cswMetadataHelper->saveToFile($cswMetadata);

            $metadata = $this->metadataApiService->add($datastoreId, $filePath);
            $metadata['csw_metadata'] = $cswMetadata;

            if (null !== $datasheetName) {
                $metadata = $this->metadataApiService->addTags($datastoreId, $metadata['_id'], [
                    CommonTags::DATASHEET_NAME => $datasheetName,
                ]);
            }

            return $this->json($metadata);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{metadataId}', name: 'get', methods: ['GET'], requirements: ['metadataId' => Requirement::UUID_V4])]
    public function get(string $datastoreId, string $metadataId): JsonResponse
    {
        try {
            $metadata = $this->metadataApiService->get($datastoreId, $metadataId);

            $fileContent = $this->metadataApiService->downloadFile($datastoreId, $metadata['_id']);
            $metadata['csw_metadata'] = $this->cswMetadataHelper->fromXml($fileContent);

            return $this->json($metadata);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{datasheetName}', name: 'get_by_datasheet_name', methods: ['GET'])]
    public function getByDatasheetName(string $datastoreId, string $datasheetName): JsonResponse
    {
        try {
            $metadataList = $this->metadataApiService->getAll($datastoreId, [
                'tags' => [
                    CommonTags::DATASHEET_NAME => $datasheetName,
                ],
            ]);

            if (0 === count($metadataList)) {
                throw new CartesApiException("Aucune métadonnée trouvée pour la fiche de données {$datasheetName}", JsonResponse::HTTP_NOT_FOUND);
            }

            $metadata = $metadataList[0];

            $fileContent = $this->metadataApiService->downloadFile($datastoreId, $metadata['_id']);

            $metadata['csw_metadata'] = $this->cswMetadataHelper->fromXml($fileContent);

            return $this->json($metadata);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{metadataId}/file', name: 'get_file_content', methods: ['GET'])]
    public function getFileContent(string $datastoreId, string $metadataId, Request $request): Response
    {
        try {
            $metadata = $this->metadataApiService->get($datastoreId, $metadataId);
            $xmlFileContent = $this->metadataApiService->downloadFile($datastoreId, $metadata['_id']);

            $format = $request->query->get('format', 'xml');

            if ('json' === $format) {
                $cswMetadata = $this->cswMetadataHelper->fromXml($xmlFileContent);

                return $this->json($cswMetadata);
            }

            return new Response($xmlFileContent, Response::HTTP_OK, [
                'Content-Type' => 'application/xml',
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{metadataId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $metadataId): JsonResponse
    {
        try {
            $this->metadataApiService->delete($datastoreId, $metadataId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{metadataId}/unpublish', name: 'unpublish', methods: ['DELETE'])]
    public function unpublish(string $datastoreId, string $metadataId): JsonResponse
    {
        try {
            $metadata = $this->metadataApiService->get($datastoreId, $metadataId);

            $endpointId = $metadata['endpoints'][0]['_id'] ?? null;
            if (null !== $endpointId) {
                $this->metadataApiService->unpublish($datastoreId, $metadata['file_identifier'], $endpointId);
            }

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
