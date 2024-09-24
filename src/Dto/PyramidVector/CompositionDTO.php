<?php

namespace App\Dto\PyramidVector;

use App\Constants\EntrepotApi\ZoomLevels;
use Symfony\Component\Validator\Constraints as Assert;

class CompositionDTO
{
    public function __construct(
        #[Assert\NotBlank(['message' => 'pyramid_add.composition.table_error'])]
        public readonly string $table,

        /**
         * @var string[]
         */
        #[Assert\Count(min: 1, minMessage: 'pyramid_add.composition.attributes_error')]
        public readonly array $attributes,

        #[Assert\Range(
            min: ZoomLevels::TOP_LEVEL_DEFAULT,
            max: ZoomLevels::BOTTOM_LEVEL_DEFAULT,
            notInRangeMessage: 'pyramid_add.composition.bottom_level_error'
        )]
        public readonly int $bottom_level,

        #[Assert\Range(
            min: ZoomLevels::TOP_LEVEL_DEFAULT,
            max: ZoomLevels::BOTTOM_LEVEL_DEFAULT,
            notInRangeMessage: 'pyramid_add.composition.top_level_error'
        )]
        #[Assert\Expression(
            'value <= this.bottom_level',
            message: 'pyramid_add.composition.level_error'
        )]
        public readonly int $top_level
    ) {
    }
}
