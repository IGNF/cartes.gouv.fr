<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class WfsTableDTO
{
    public function __construct(
        #[Assert\NotBlank(['message' => 'wfs_add.table.name_error'])]
        public readonly string $native_name,

        #[Assert\NotBlank(['message' => 'wfs_add.table.title_error'])]
        public readonly string $title,

        #[Assert\NotBlank(['message' => 'wfs_add.table.description_error'])]
        public readonly string $description,

        public readonly ?string $public_name,

        /** @var array<string> */
        public readonly ?array $keywords
    ) {
    }
}
