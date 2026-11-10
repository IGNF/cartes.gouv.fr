<?php

namespace App\Tests\Support;

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
        $metadata->title = 'Titre';
        $metadata->abstract = 'Résumé';
        $metadata->creation_date = '2024-01-15';
        $metadata->resource_genealogy = 'Généalogie';
        $metadata->inspire_keywords = ['Occupation des terres'];
        $metadata->free_keywords = ['libre', 'autre'];
        $metadata->topic_categories = ['planningCadastre', 'environment'];
        $metadata->contact_email = 'contact@example.test';
        $metadata->organisation_name = 'Organisation';
        $metadata->organisation_email = 'orga@example.test';
        $metadata->resolution = '100';
        $metadata->bbox = ['west' => -5.5, 'east' => 9.5, 'south' => 41.0, 'north' => 51.5];
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
        $metadata->frequency_code = 'monthly';

        return $metadata;
    }
}
