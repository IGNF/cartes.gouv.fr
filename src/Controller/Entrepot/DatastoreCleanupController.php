<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Workflow\DatastoreCleanupWorkflow;
use OpenApi\Attributes as OA;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\EventStreamResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\ServerEvent;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/cleanup',
    name: 'cartesgouvfr_api_datastore_cleanup_',
    options: ['expose' => true]
)]
#[OA\Tag(name: '[entrepot] datastores nettoyage')]
class DatastoreCleanupController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly DatastoreCleanupWorkflow $datastoreCleanupWorkflow,
        private readonly LoggerInterface $logger,
    ) {
    }

    #[Route('/content', name: 'get_content', methods: ['GET'], condition: 'request.isXmlHttpRequest()')]
    public function getContentToBeDeleted(string $datastoreId): JsonResponse
    {
        $counts = $this->datastoreCleanupWorkflow->count($datastoreId);

        return $this->json([
            'entities' => $counts,
        ]);
    }

    #[Route('/delete-stream', name: 'delete_content_stream', methods: ['POST'], condition: 'request.isXmlHttpRequest()')]
    public function deleteContentStream(string $datastoreId): EventStreamResponse
    {
        return new EventStreamResponse(function (EventStreamResponse $response) use ($datastoreId): void {
            set_time_limit(0);

            $emit = static function (string $type, array $payload) use ($response): void {
                $response->sendEvent(new ServerEvent(json_encode($payload, JSON_THROW_ON_ERROR), type: $type));
            };

            try {
                $counts = $this->datastoreCleanupWorkflow->count($datastoreId);
                $emit('started', [
                    'entities' => $counts,
                ]);

                $result = $this->datastoreCleanupWorkflow->deleteSequentially(
                    $datastoreId,
                    $emit,
                    static fn (): bool => (bool) connection_aborted(),
                    $counts
                );

                if (!connection_aborted()) {
                    $emit('done', [
                        'entities' => $result['counts'],
                        'failedItems' => $result['failedItems'],
                    ]);
                }
            } catch (\Throwable $exception) {
                $this->logger->error('Error during datastore deletion', [
                    'datastoreId' => $datastoreId,
                    'exception' => $exception,
                ]);
                if (!connection_aborted()) {
                    $emit('failed', [
                        'message' => 'La suppression du contenu de l\'entrepôt a échoué.',
                    ]);
                }
            }
        });
    }
}
