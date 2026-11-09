<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Controller\ApiControllerInterface;
use App\Dto\Metadata\CswMetadata;
use App\Exception\AppException;
use App\Services\CswMetadataXmlReader;
use App\Services\CswMetadataXmlWriter;
use App\Services\EntrepotApi\MetadataApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Serializer\SerializerInterface;

#[Route(
    '/api/datastores/{datastoreId}/metadata',
    name: 'cartesgouvfr_api_metadata_',
    options: ['expose' => true])]
#[OA\Tag(name: '[entrepot] metadata')]
class MetadataController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly MetadataApiService $metadataApiService,
        private readonly CswMetadataXmlReader $cswMetadataReader,
        private readonly CswMetadataXmlWriter $cswMetadataWriter,
        private readonly SerializerInterface $serializer,
    ) {
    }

    #[Route('', name: 'get_list', methods: ['GET'])]
    public function getList(
        string $datastoreId,
        Request $request,
    ): JsonResponse {
        $query = $request->query->all();

        $metadataList = $this->metadataApiService->getAll($datastoreId, $query)->resolve();

        return $this->json($metadataList);
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, Request $request): JsonResponse
    {
        $datasheetName = $request->query->get(CommonTags::DATASHEET_NAME);

        $cswMetadata = $this->serializer->deserialize($request->getContent(), CswMetadata::class, 'json');
        $filePath = $this->cswMetadataWriter->saveToFile($cswMetadata);

        $metadata = $this->metadataApiService->add($datastoreId, $filePath);
        $metadata['csw_metadata'] = $cswMetadata;

        if (null !== $datasheetName) {
            $metadata = $this->metadataApiService->addTags($datastoreId, $metadata['_id'], [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ])->array();
        }

        return $this->json($metadata);
    }

    #[Route('/{metadataId}', name: 'get', methods: ['GET'], requirements: ['metadataId' => Requirement::UUID_V4])]
    public function get(string $datastoreId, string $metadataId): JsonResponse
    {
        $metadata = $this->metadataApiService->get($datastoreId, $metadataId)->array();

        $fileContent = $this->metadataApiService->downloadFile($datastoreId, $metadata['_id'])->text();
        $metadata['csw_metadata'] = $this->cswMetadataReader->read($fileContent);

        return $this->json($metadata);
    }

    #[Route('/{datasheetName}', name: 'get_by_datasheet_name', methods: ['GET'])]
    public function getByDatasheetName(string $datastoreId, string $datasheetName): JsonResponse
    {
        $metadataList = $this->metadataApiService->getAll($datastoreId, [
            'tags' => [
                CommonTags::DATASHEET_NAME => $datasheetName,
            ],
        ])->resolve();

        if (0 === count($metadataList)) {
            throw new AppException("Aucune métadonnée trouvée pour la fiche de données {$datasheetName}", JsonResponse::HTTP_NOT_FOUND);
        }

        $metadata = $metadataList[0];

        $fileContent = $this->metadataApiService->downloadFile($datastoreId, $metadata['_id'])->text();

        $metadata['csw_metadata'] = $this->cswMetadataReader->read($fileContent);

        return $this->json($metadata);
    }

    #[Route('/{metadataId}/file', name: 'get_file_content', methods: ['GET'])]
    public function getFileContent(string $datastoreId, string $metadataId, Request $request): Response
    {
        $xmlFileContent = $this->metadataApiService->downloadFile($datastoreId, $metadataId)->text();

        $format = $request->query->get('format', 'xml');

        if ('json' === $format) {
            $cswMetadata = $this->cswMetadataReader->read($xmlFileContent);

            return $this->json($cswMetadata);
        }

        return new Response($xmlFileContent, Response::HTTP_OK, [
            'Content-Type' => 'application/xml',
        ]);
    }

    #[Route('/{metadataId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $datastoreId, string $metadataId): JsonResponse
    {
        $this->metadataApiService->delete($datastoreId, $metadataId)->await();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }

    #[Route('/{metadataId}/unpublish', name: 'unpublish', methods: ['DELETE'])]
    public function unpublish(string $datastoreId, string $metadataId): JsonResponse
    {
        $metadata = $this->metadataApiService->get($datastoreId, $metadataId)->array();

        $endpointId = $metadata['endpoints'][0]['_id'] ?? null;
        if (null !== $endpointId) {
            $this->metadataApiService->unpublish($datastoreId, $metadata['file_identifier'], $endpointId)->await();
        }

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }
}
