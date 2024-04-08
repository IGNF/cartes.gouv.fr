<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\MetadataFields;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use App\Services\MetadataHelper;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Uid\Uuid;

#[Route(
    '/api/datastores/{datastoreId}/metadata',
    name: 'cartesgouvfr_api_metadata_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class MetadataController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService,
        private MetadataHelper $metadataHelper
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getList(
        string $datastoreId,
        Request $request
    ): JsonResponse {
        try {
            $query = $request->query->all();

            $metadataList = $this->entrepotApiService->metadata->getAll($datastoreId, $query);

            return $this->json($metadataList);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        try {
            $metadataArgs = json_decode($request->getContent(), true);
            $datasheetName = $request->query->get(CommonTags::DATASHEET_NAME, null);

            $metadataArgs = [
                ...$metadataArgs,
                MetadataFields::HIERARCHY_LEVEL => $metadataArgs[MetadataFields::HIERARCHY_LEVEL] ?? 'series',
                MetadataFields::LANGUAGE => $metadataArgs[MetadataFields::LANGUAGE] ?? 'fre',
                MetadataFields::CHARSET => $metadataArgs[MetadataFields::CHARSET] ?? 'utf8',
                MetadataFields::FILE_IDENTIFIER => $metadataArgs[MetadataFields::FILE_IDENTIFIER] ?? Uuid::v4(),
            ];

            $xmlContent = $this->metadataHelper->convertArrayToXml($metadataArgs);
            $filePath = $this->metadataHelper->saveToFile($xmlContent);

            $metadata = $this->entrepotApiService->metadata->add($datastoreId, $filePath);

            if (null !== $datasheetName) {
                $metadata = $this->entrepotApiService->metadata->addTags($datastoreId, $metadata['_id'], [
                    CommonTags::DATASHEET_NAME => $datasheetName,
                ]);
            }

            return $this->json($metadata);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{metadataId}', name: 'get', methods: ['GET'], requirements: ['metadataId' => Requirement::UUID_V4])]
    public function get(string $datastoreId, string $metadataId): JsonResponse
    {
        try {
            $metadata = $this->entrepotApiService->metadata->get($datastoreId, $metadataId);
            $fileContent = $this->entrepotApiService->metadata->downloadFile($datastoreId, $metadataId);

            $metadata['content'] = $this->metadataHelper->convertXmlToArray($fileContent);

            return $this->json($metadata);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{datasheetName}', name: 'get_by_datasheet_name', methods: ['GET'])]
    public function getByDatasheetName(string $datastoreId, string $datasheetName): JsonResponse
    {
        try {
            $metadataList = $this->entrepotApiService->metadata->getAll($datastoreId, [
                'tags' => [
                    CommonTags::DATASHEET_NAME => $datasheetName,
                ],
            ]);

            if (0 === count($metadataList)) {
                throw new CartesApiException("Aucune métadonnée trouvée pour la fiche de données {$datasheetName}", JsonResponse::HTTP_NOT_FOUND);
            }

            $metadata = $metadataList[0];
            $fileContent = $this->entrepotApiService->metadata->downloadFile($datastoreId, $metadata['_id']);

            $metadata['content'] = $this->metadataHelper->convertXmlToArray($fileContent);

            return $this->json($metadata);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails());
        }
    }

    #[Route('/{metadataId}/file', name: 'get_file_content', methods: ['GET'])]
    public function getFileContent(string $datastoreId, string $metadataId, Request $request): Response
    {
        try {
            $fileContent = $this->entrepotApiService->metadata->downloadFile($datastoreId, $metadataId);

            $format = $request->query->get('format', 'xml');

            if ('json' === $format) {
                $contentJson = $this->metadataHelper->convertXmlToArray($fileContent);

                return $this->json($contentJson);
            }

            return new Response($fileContent, Response::HTTP_OK, [
                'Content-Type' => 'application/xml',
            ]);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{metadataId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $metadataId): JsonResponse
    {
        try {
            $this->entrepotApiService->metadata->delete($datastoreId, $metadataId);

            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        } catch (\Exception $ex) {
            throw new CartesApiException($ex->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
