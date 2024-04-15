<?php

namespace App\Dto\Datastore;

use DateTime;
use App\Constants\PermissionTypes;
use Symfony\Component\Validator\Constraints as Assert;

class PermissionDTO {
    public function __construct(
        #[Assert\NotBlank([
            'message' => 'permission.licence_mandatory'
        ])]
        public readonly string $licence,

        #[Assert\Choice([
            'choices' => [PermissionTypes::ACCOUNT, PermissionTypes::COMMUNITY],
            'message' => 'permission.type_error'
        ])]
        public readonly string $type,

        public ? string $end_date,

        /** @var array<string> */
        #[Assert\Unique(['message' => 'permission.beneficiaries.unique_error'])]
        #[Assert\All([
            'constraints' => [
                new Assert\NotBlank([
                    'message' => 'permission.beneficiaries.at_least_one'
                ]),
                new Assert\Uuid([
                    'message' => 'permission.beneficiaries.uuid_error'
                ])
            ]
        ])]
        public readonly array $beneficiaries,

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

        #[Assert\Type(
            type: 'boolean',
            message: 'permission.only_oauth_error',
        )]
        public readonly bool $only_oauth
    ) {
    }
}