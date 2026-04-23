<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Workflow\DatastoreCleanupWorkflow;
use OpenApi\Attributes as OA;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
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
        private DatastoreCleanupWorkflow $datastoreDeletionWorkflow,
        private readonly LoggerInterface $logger,
    ) {
    }

    #[Route('/', name: 'get_content', methods: ['GET'], condition: 'request.isXmlHttpRequest()')]
    public function getContentToBeDeleted(string $datastoreId): JsonResponse
    {
        try {
            $counts = $this->datastoreDeletionWorkflow->count($datastoreId);

            return $this->json([
                'entities' => $counts,
            ]);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/', name: 'delete_content_stream', methods: ['GET'])]
    public function deleteContentStream(string $datastoreId): StreamedResponse
    {
        ini_set('zlib.output_compression', '0');

        $response = new StreamedResponse(function () use ($datastoreId) {
            set_time_limit(0);

            $emit = function (string $event, array $payload): void {
                echo "event: $event\n";
                echo 'data: '.json_encode($payload)."\n\n";

                StreamedResponse::closeOutputBuffers(0, true);
                flush();
            };

            $counts = $this->datastoreDeletionWorkflow->count($datastoreId);
            $emit('started', [
                'entities' => $counts,
            ]);

            try {
                $counts = $this->datastoreDeletionWorkflow->deleteSequentially(
                    $datastoreId,
                    $emit,
                    static fn (): bool => (bool) connection_aborted(),
                    $counts
                );

                // $i = 5;
                // while (--$i > 0) {
                //     if (!connection_aborted()) {
                //         $emit('progress', ['entities' => [
                //             ...$counts,
                //             'dummy' => $i,
                //         ]]);
                //     }

                //     sleep(2);
                // }

                if (!connection_aborted()) {
                    $emit('done', [
                        'entities' => $counts,
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

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache, no-transform');
        $response->headers->set('Connection', 'keep-alive');
        $response->headers->set('X-Accel-Buffering', 'no');

        return $response;
    }
}
