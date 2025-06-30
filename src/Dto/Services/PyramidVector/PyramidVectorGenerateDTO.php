<?php

namespace App\Dto\Services\PyramidVector;

use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;

class PyramidVectorGenerateDTO
{
    public function __construct(
        #[Assert\NotBlank(['message' => 'pyramid_add.technical_name_error'])]
        #[Assert\Regex(['pattern' => '/^[\w\-\.]+$/', 'message' => 'pyramid_add.technical_name_regex'])]
        #[SerializedName('technical_name')]
        public readonly string $technical_name,

        #[Assert\Regex(['pattern' => '/^POLYGON/i', 'message' => 'pyramid_add.sample.area_wkt'])]
        public readonly ?string $area,

        #[Assert\NotBlank(['message' => 'pyramid_add.tippecanoe_error'])]
        public readonly string $tippecanoe,

        #[Assert\NotBlank(['message' => 'pyramid_add.vector_id_error'])]
        #[SerializedName('vectordb_id')]
        public readonly string $vectordb_id,

        /**
         * @var PyramidVectorCompositionDTO[]
         */
        #[Assert\Valid]
        public readonly array $composition,
    ) {
    }
}
