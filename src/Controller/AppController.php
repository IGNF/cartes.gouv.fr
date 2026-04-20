<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class AppController extends AbstractController
{
    #[Route(
        '/{reactRouting}',
        name: 'cartesgouvfr_app',
        priority: -1,
        defaults: ['reactRouting' => null],
        requirements: ['reactRouting' => '.+'],
        options: ['expose' => true]
    )]
    public function app(UrlGeneratorInterface $urlGenerator): Response
    {
        $appRoot = $urlGenerator->generate('cartesgouvfr_app', [], UrlGeneratorInterface::ABSOLUTE_PATH);
        $appRoot = substr($appRoot, 0, -1);

        return $this->render('app.html.twig', [
            'app_root' => $appRoot,
        ]);
    }

    #[Route('/test-sse', name: 'cartesgouvfr_test_sse')]
    public function testSSE(): StreamedResponse
    {
        $response = new StreamedResponse(function () {
            foreach ($this->watchJobsInProgress() as $job) {
                echo "type: jobs\n";
                echo 'data: '.json_encode($job)."\n\n";

                StreamedResponse::closeOutputBuffers(0, true);
                flush();

                if (connection_aborted()) {
                    break;
                }

                sleep(1);
            }
        });
        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('Connection', 'keep-alive');
        $response->headers->set('X-Accel-Buffering', 'no');

        return $response;
    }

    private function watchJobsInProgress(): array
    {
        return [
            (object) ['id' => 1, 'status' => 'in_progress'],
            (object) ['id' => 2, 'status' => 'in_progress'],
            (object) ['id' => 3, 'status' => 'in_progress'],
        ];
    }
}
