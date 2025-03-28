<?php

namespace App\Entity\CswMetadata;

class CswMetadataLayer
{
    public function __construct(
        public string $name,
        public string $gmdOnlineResourceProtocol,
        public string $gmdOnlineResourceUrl,
        public string $offeringId,
    ) {
    }
}
