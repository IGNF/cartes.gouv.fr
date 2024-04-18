<?php

namespace App\Dto\User;

use Symfony\Component\Validator\Constraints as Assert;

class IPListDTO
{
    public function __construct(
        #[Assert\Choice([
            'choices' => ['whitelist', 'blacklist'],
            'message' => 'user_key.ip_list.name_error',
        ])]
        public readonly string $name,

        /** @var array<string> */
        #[Assert\Unique(['message' => 'user_key.ip_list.unique_error'])]
        #[Assert\All([
            'constraints' => [
                new Assert\NotBlank([
                    'message' => 'user_key.ip_list.ip_not_blank',
                ]),
                new Assert\Cidr([
                    'message' => 'user_key.ip_list.ip_error',
                ]),
            ],
        ])]
        public readonly array $addresses,
    ) {
    }
}
