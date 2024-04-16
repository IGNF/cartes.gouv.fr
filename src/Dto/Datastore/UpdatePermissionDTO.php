<?php

namespace App\Dto\Datastore;

use Symfony\Component\Validator\Constraints as Assert;

class UpdatePermissionDTO {
    public function __construct(
        #[Assert\NotBlank([
            'message' => 'permission.licence_mandatory'
        ])]
        public readonly string $licence,

        public ? string $end_date,

        /** @var array<string> */
        #[Assert\Unique(['message' => 'permission.offerings.unique_error'])]
        #[Assert\All([
            'constraints' => [
                new Assert\NotBlank([
                    'message' => 'permission.offerings.at_least_one'
                ]),
                new Assert\Uuid([
                    'message' => 'permission.offerings.uuid_error'
                ])
            ]
        ])]
        public readonly array $offerings,
    ) {
    }
}