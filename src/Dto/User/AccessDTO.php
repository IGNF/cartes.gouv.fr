<?php

namespace App\Dto\User;

use Symfony\Component\Validator\Constraints as Assert;

class AccessDTO
{
    public function __construct(
        #[Assert\NotBlank(['message' => 'user_key.access.permission_mandatory'])]
        #[Assert\Uuid(['message' => 'user_key.access.permission_uuid_error'])]
        public readonly string $permission,

        /** @var array<string> */
        #[Assert\Count(
            min: 1,
            minMessage: 'user_key.access.offerings.at_least_one',
        )]
        #[Assert\Unique(['message' => 'user_key.access.offerings.unique_error'])]
        #[Assert\All(
            new Assert\Uuid(['message' => 'user_key.access.offerings.uuid_error'])
        )]
        public readonly array $offerings
    ) {
    }
}
