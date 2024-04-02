<?php

namespace App\Controller;

use App\Constants\MetadataFields;
use App\Services\MetadataBuilder;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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

    #[Route('/test/generate/metadata', name: 'test_metadata')]
    public function testMetadata(MetadataBuilder $metadataBuilder): Response
    {
        $abstract = <<<EOD
        Cette table permet de connaitre le sens de circulation par rapport au sens de saisie du tronçon de la voie.

        Une voie peut comporter plusieurs tronçons. A chaque intersection, il y a un nouveau tronçon.  

        **A titre d'exemple:**

        Si le tracé du tronçon est le même que le sens de la circulation, alors il s'agit d'un sens "aller".
        Si le tracé du tronçon est dans le sens opposé à la circulation, alors il s'agit d'un sens "retour".
        Si la circulation est en double sens, alors la valeur est "double sens".

        Parmi les types de sens présents dans le champ "sens", on retrouve:

        * SENS UNIQUE RETOUR ET BUS A CONTRESENS : saisie du tronçon dans le sens opposé à la circulation ( circulation à SENS UNIQUE) + voie bus à contresens
        * DOUBLE SENS: pas d'indication sur le sens du tronçon car le sens de saisie est forcément correct.
        * CIRCULATION INTERDITE SAUF RIVERAINS : Circulation des riverains est à double sens
        * SENS UNIQUE RETOUR : saisie du tronçon dans le sens opposé à la circulation ( circulation à SENS UNIQUE) 
        * SENS UNIQUE ALLER ET CYCLE A CONTRESENS : saisie du tronçon dans le même sens que la circulation ( circulation à SENS UNIQUE) + voie cyclable à contresens
        * SENS UNIQUE ALLER ET BUS A CONTRESENS : saisie du tronçon dans le même sens que la circulation ( circulation à SENS UNIQUE) + voie bus à contresens
        * SENS UNIQUE ALLER : saisie du tronçon dans le même sens que la circulation ( circulation à SENS UNIQUE)
        * SENS UNIQUE RETOUR ET CYCLE A CONTRESENS : saisie du tronçon opposé au sens de la circulation (circulation à SENS UNIQUE) + voie cyclable à contresens
        EOD;

        $contactEmail = 'orka.cruze@ign.fr';
        $organisationName = "Institut national de l'information géographique et forestière (IGN-F)";
        $organisationEmail = 'sav@ign.fr';

        $thematicCategories = ['administration', 'altitude', 'aspects militaires', 'bâtiments', 'eau', 'énergie', 'géographie', 'hydrographie', 'industrie', 'information', 'installations agricoles et aquacoles', 'lieux de production et sites industriels', 'occupation des terres', 'référentiels de coordonnées', 'répartition de la population, démographie', 'toponymie', 'transport', 'unités administratives', 'usage des sols', 'végétation'];

        $xml = $metadataBuilder->buildXml([
            MetadataFields::FILE_IDENTIFIER => 'IGN_donnée_quelque_chose',
            MetadataFields::HIERARCHY_LEVEL => 'series',
            MetadataFields::LANGUAGE => 'fre',
            MetadataFields::CHARSET => 'utf8',
            MetadataFields::TITLE => "C'est l'intitulé",
            MetadataFields::ABSTRACT => $abstract,
            MetadataFields::CREATION_DATE => (new \DateTime())->format('Y-m-d'),
            MetadataFields::THEMATIC_CATEGORIES => $thematicCategories,
            MetadataFields::CONTACT_EMAIL => $contactEmail,
            MetadataFields::ORGANISATION_NAME => $organisationName,
            MetadataFields::ORGANISATION_EMAIL => $organisationEmail,
            MetadataFields::LAYER_NAMES => ['hydro-ardennes-l93_gpkg_04-07-2023:cours_d_eau', 'hydro-ardennes-l93_gpkg_04-07-2023:troncon_hydrographique', 'hydro-ardennes-l93_gpkg_04-07-2023:plan_d_eau'],
            MetadataFields::ENDPOINT_URL => 'https://geoplateforme-gpf-apim.qua.gpf-tech.ign.fr/wfs',
            MetadataFields::ENDPOINT_TYPE => 'OGC:WFS',
        ]);
        $metadataBuilder->saveToFile($xml);

        $response = new Response($xml);
        $response->headers->set('Content-Type', 'application/xml');

        return $response;
    }
}
