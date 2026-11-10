<?php

namespace App\Exception;

/**
 * Document XML sans élément gmd:MD_Metadata : cas d’une réponse CSW GetRecordById vide.
 */
class MissingCswMetadataException extends InvalidCswMetadataException
{
    public function __construct()
    {
        parent::__construct('aucun élément gmd:MD_Metadata dans le document');
    }
}
