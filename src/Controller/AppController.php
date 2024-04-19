<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
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
            // 'info_banner_msg' => 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae officiis incidunt, quia unde quisquam adipisci eum excepturi voluptas delectus voluptatibus consectetur porro necessitatibus itaque ipsum deserunt fugit. Iure, id obcaecati!',
        ]);
    }

    #[Route(
        '/catalogue/metadata/{fileIdentifier}',
        name: 'cartesgouvfr_catalogue_datasheet_view',
        methods: ['GET'],
        options: ['expose' => true]
    )]
    public function userInfoEdit(string $fileIdentifier, ParameterBagInterface $params): RedirectResponse
    {
        $catalogueUrl = $params->get('catalogue_url');

        $metadataUrl = "{$catalogueUrl}/dataset/{$fileIdentifier}";

        return $this->redirect($metadataUrl);
    }
}
