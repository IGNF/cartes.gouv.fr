<?php

namespace App\Controller;

use App\Exception\SandboxUnavailableException;
use App\Services\SandboxService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class AppController extends AbstractController
{
    public const HEALTH_ROUTE = 'cartesgouvfr_app_health';
    public const READY_ROUTE = 'cartesgouvfr_app_ready';

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

    #[Route(
        '/tableau-de-bord/health',
        name: self::HEALTH_ROUTE,
        options: ['expose' => true]
    )]
    public function health(): Response
    {
        return new Response('OK', Response::HTTP_OK);
    }

    /**
     * Readiness : vérifie que la communauté du bac à sable est joignable (réponse en cache 24 h après le premier succès).
     */
    #[Route(
        '/tableau-de-bord/ready',
        name: self::READY_ROUTE,
        options: ['expose' => true]
    )]
    public function ready(SandboxService $sandboxService): Response
    {
        try {
            $sandboxService->assertAvailable();
        } catch (SandboxUnavailableException) {
            return new Response('NOT READY', Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return new Response('READY', Response::HTTP_OK);
    }
}
