<?php

namespace App\Controller;

use App\Services\CswMetadataHelper;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
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
        ]);
    }

    /*#[Route(
        '/test/xml',
        name: 'cartesgouvfr_app_test_xml',
    )]
    public function testXML(ParameterBagInterface $parameterBagInterface, CswMetadataHelper $helper)
    {
        $filepath = $parameterBagInterface->get('assets_directory') . '/data/test_maria.xml';
        $content = file_get_contents($filepath);

        $md = $helper->fromXml($content);

        return new JsonResponse("coucou");
    }*/
}
