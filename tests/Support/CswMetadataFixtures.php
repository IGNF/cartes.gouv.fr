<?php

declare(strict_types=1);

namespace App\Tests\Support;

use App\Dto\Datasheet\ProducerDTO;
use App\Dto\Datasheet\ResourceConditionDTO;
use App\Dto\Datasheet\SubConstraintDTO;
use App\Dto\Datasheet\TerritoryDTO;
use App\Dto\Metadata\CswHierarchyLevel;
use App\Dto\Metadata\CswMetadata;
use App\Dto\Metadata\CswOnlineResource;
use App\Dto\Metadata\CswOnlineResourceType;

/**
 * Objets CswMetadata de référence, partagés par les tests du sérialiseur, du lecteur et du rédacteur XML.
 */
final class CswMetadataFixtures
{
    public const DIR = __DIR__.'/../Fixture/metadata';
    // instant d’écriture des fichiers de référence (gmd:dateStamp)
    public const NOW = '2026-11-09 12:00:00';

    public static function xml(string $name): string
    {
        return (string) file_get_contents(self::DIR."/$name.xml");
    }

    // toutes les propriétés renseignées ; la couche privée porte la description que le gabarit dérive de son nom
    public static function full(): CswMetadata
    {
        $metadata = new CswMetadata();
        $metadata->file_identifier = 'fid';
        $metadata->hierarchy_level = CswHierarchyLevel::Dataset;
        $metadata->name = 'Titre';
        $metadata->description = 'Résumé';
        $metadata->date_creation = '2024-01-15';
        $metadata->date_publication = '2024-02-01';
        $metadata->date_revision = '2024-03-01';
        $metadata->resource_genealogy = 'Généalogie';
        $metadata->keywords_inspire = ['Occupation des terres'];
        $metadata->keywords_additional = ['libre', 'autre'];
        $metadata->themes = ['planningCadastre', 'environment'];
        // ordre de relecture : points de contact dans l’ordre écrit, puis le contact des métadonnées
        $metadata->producers = [
            new ProducerDTO('Organisation', 'orga@example.test', 'pointOfContact', '1 rue de l’Exemple', '75000', 'Ville'),
            new ProducerDTO('Gestionnaire', 'gestion@example.test', 'custodian'),
            new ProducerDTO('Auteur', 'auteur@example.test', 'author'),
            new ProducerDTO('Contact', 'contact@example.test', 'contact'),
        ];
        // ordre de relecture : chaque restriction suivie de sa compagne
        $metadata->resource_constraints = [
            new ResourceConditionDTO('legal', [
                new SubConstraintDTO('accessConstraints', restriction_code: 'otherRestrictions'),
                new SubConstraintDTO('otherConstraints', limitation_code: 'INSPIRE_Directive_Article13_1b'),
                new SubConstraintDTO('useConstraints', restriction_code: 'license'),
                new SubConstraintDTO('useLimitation', url: 'https://www.etalab.gouv.fr/licence-ouverte-open-licence/', description: 'Licence Ouverte 2.0'),
            ]),
            new ResourceConditionDTO('legal', [
                new SubConstraintDTO('accessConstraints', restriction_code: 'otherRestrictions'),
                new SubConstraintDTO('otherConstraints', limitation_code: 'conditionsUnknown'),
            ]),
            new ResourceConditionDTO('security', [
                new SubConstraintDTO('useLimitation', description: 'Diffusion restreinte'),
                new SubConstraintDTO('classification', classification_code: 'restricted'),
            ]),
            new ResourceConditionDTO('other', [new SubConstraintDTO('useLimitation', description: 'Usage interne')]),
        ];
        $metadata->scale = 100;
        $metadata->territories = [
            new TerritoryDTO('COMMUNE_TEST_1', 'Commune test', [2.25, 48.8, 2.45, 48.9]),
            new TerritoryDTO('COMMUNE_TEST_2', 'Commune d’outre-mer', [-61.8, 15.8, -61.0, 16.5]),
        ];
        $metadata->resolution = 0.5;
        $metadata->online_resources = [
            CswOnlineResource::layer('ns:couche', 'OGC:WFS', 'https://data.example.test/wfs', true),
            CswOnlineResource::layer('couche_privee', 'OGC:WMS', 'https://data.example.test/wms-v', false, 'couche_privee - Accès restreint'),
            CswOnlineResource::layer('tuiles', 'TMS', 'https://data.example.test/tms/1.0.0', true),
            CswOnlineResource::style('Style sombre', 'Style pour la couche ns:couche', 'https://annexes.example.test/style.json'),
            CswOnlineResource::capabilities('GetCapabilities - WFS', 'Service WFS', 'https://annexes.example.test/wfs/capabilities.xml', 'WFS'),
            CswOnlineResource::document('Notice', null, 'https://annexes.example.test/notice.pdf'),
            CswOnlineResource::document('Site', 'Site du producteur', 'https://example.test'),
            // ressource d’un autre outil, ni couche ni fichier connu : conservée telle quelle
            new CswOnlineResource(CswOnlineResourceType::Other, 'Service ArcGIS', 'https://arcgis.example.test/rest', 'ESRI:ArcGIS', 'Hors catalogue'),
        ];
        $metadata->thumbnail_url = 'https://annexes.example.test/thumb.png';
        $metadata->update_frequency = 'monthly';

        return $metadata;
    }
}
