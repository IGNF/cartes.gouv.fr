<?php

namespace App\Dto\Services\PyramidVector;

use Symfony\Component\Validator\Constraints as Assert;

class PyramidVectorGenerateDTO
{
    public function __construct(
        #[Assert\NotBlank(message: 'pyramid_add.technical_name_error')]
        #[Assert\Regex(pattern: '/^[\w\-\.]+$/', message: 'pyramid_add.technical_name_regex')]
        public readonly string $technical_name,

        #[Assert\NotBlank(message: 'pyramid_add.tippecanoe_error')]
        public readonly string $tippecanoe,

        #[Assert\NotBlank(message: 'pyramid_add.vector_id_error')]
        public readonly string $vectordb_id,

        /**
         * @var PyramidVectorCompositionDTO[]
         */
        #[Assert\Count(min: 1, minMessage: 'pyramid_add.composition.required')]
        #[Assert\Valid]
        public readonly array $composition,

        public readonly bool $email_notification = true,
    ) {
    }
}
