<?php

declare(strict_types=1);

namespace App\Dto\Metadata;

/**
 * Nature d’une ressource en ligne (gmd:onLine) de la fiche, déduite de gmd:protocol à la lecture.
 */
enum CswOnlineResourceType: string
{
    case Layer = 'layer';
    case Style = 'style';
    case Capabilities = 'capabilities';
    case Document = 'document';
    // ressource non classable, conservée telle quelle pour ne pas la perdre à la réécriture
    case Other = 'other';
}
