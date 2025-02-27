<?php

namespace App\Dto\Espaceco\Members;

use Symfony\Component\Validator\Constraints as Assert;

class AddMembersDTO
{
    /**
     * @param array<mixed> $members
     */
    public function __construct(
        #[Assert\All([
            new Assert\AtLeastOneOf([
                new Assert\Positive(),
                new Assert\Email([
                    'message' => 'espaceco.add_members.email_error',
                ]),
            ]),
        ])]
        public readonly array $members = [],
    ) {
    }
}
