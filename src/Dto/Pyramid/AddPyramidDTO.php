<?php

namespace App\Dto\Pyramid;

use Symfony\Component\Validator\Constraints as Assert;

class AddPyramidDTO
{
    public function __construct(
        #[Assert\NotBlank(['message' => 'pyramid_add.technical_name_error'])]
        #[Assert\Regex(['pattern' => '/^[\w\-\.]+$/', 'message' => 'pyramid_add.technical_name_regex'])]
        public readonly string $technical_name,

        #[Assert\Regex(['pattern' => '/^POLYGON/i', 'message' => 'pyramid_add.sample.area_wkt'])]
        public readonly ?string $area,

        #[Assert\NotBlank(['message' => 'pyramid_add.tippecanoe_error'])]
        public readonly string $tippecanoe,

        #[Assert\NotBlank(['message' => 'pyramid_add.vector_id_error'])]
        public readonly string $vectordb_id,

        /**
         * @var CompositionDTO[]
         */
        #[Assert\Valid]
        public readonly array $composition
    ) {
    }
}
