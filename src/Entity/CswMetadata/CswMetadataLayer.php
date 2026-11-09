<?php

namespace App\Entity\CswMetadata;

use Symfony\Component\Serializer\Attribute\SerializedName;

class CswMetadataLayer
{
    public function __construct(
        public string $name,
        #[SerializedName('gmd_online_resource_protocol')]
        public string $gmdOnlineResourceProtocol,
        #[SerializedName('gmd_online_resource_url')]
        public string $gmdOnlineResourceUrl,
        #[SerializedName('offering_id')]
        public string $offeringId,
        public bool $open,
        public ?string $description = null,
    ) {
    }
}
