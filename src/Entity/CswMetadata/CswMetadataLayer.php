<?php

namespace App\Entity\CswMetadata;

class CswMetadataLayer
{
    public function __construct(
        public string $name,
        public string $endpointType,
        public string $endpointUrl,
        public string $offeringId,
    ) {
    }
}
