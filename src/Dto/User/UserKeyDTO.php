<?php

namespace App\Dto\User;
 
use App\Dto\User\AccessDTO;
use App\Constants\UserKeyTypes;
use App\Validator\Constraint as CustomAssert;
use Symfony\Component\Validator\Constraints as Assert;

class UserKeyDTO {
    public function __construct(
        #[Assert\NotBlank([
            'message' => 'user_key.name_mandatory'
        ])]
        public readonly string $name,

        #[Assert\Choice([
            'choices' => [UserKeyTypes::HASH, UserKeyTypes::BASIC, UserKeyTypes::OAUTH2],
            'message' => 'user_key.type_error'
        ])]
        public readonly string $type,

        #[Assert\Type(['type' => 'string', 'message' => 'user_key.user_agent_not_blank'])]
        public readonly ?string $user_agent,

        #[Assert\Type(['type' => 'string', 'message' => 'user_key.referer_not_blank'])]
        public readonly ?string $referer,

        /** @var array<string> */
        #[Assert\Unique(['message' => 'user_key.iplist_unique_error'])]
        #[Assert\All([
            'constraints' => [
                new Assert\NotBlank([
                    'message' => 'user_key.ip_not_blank'
                ]),
                new Assert\Cidr([
                    'message' => 'user_key.ip_error'
                ])
            ]
        ])]
        public readonly ?array $whitelist,

        /** @var array<string> */
        #[Assert\Unique(['message' => 'user_key.iplist_unique_error'])]
        #[Assert\All([
            'constraints' => [
                new Assert\NotBlank([
                    'message' => 'user_key.ip_not_blank'
                ]),
                new Assert\Cidr([
                    'message' => 'user_key.ip_error'
                ])
            ]
        ])]
        public readonly ?array $blacklist,

        /** @var array<string> */
        #[CustomAssert\TypeInfosConstraint]
        public readonly array $type_infos,

        /* TODO OBLIGATOIRE OU PAS ?? */
        #[Assert\Valid]
        public readonly ?AccessDTO $access
    ) {
    }
}