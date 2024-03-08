<?php

namespace App\Dto\User;
 
use App\Dto\User\AccessDTO;
use App\Dto\User\IPListDTO;
use App\Constants\UserKeyTypes;
use App\Validator\Constraint as CustomAssert;
use Symfony\Component\Validator\Constraints as Assert;

class UserKeyDTO {
    public function __construct(
        #[Assert\NotBlank([
            'message' => 'user_key.name_mandatory'
        ])]
        public readonly string $name,

        /** @var array<AccessDTO> */
        #[Assert\Valid]
        public readonly array $accesses,

        #[Assert\Choice([
            'choices' => [UserKeyTypes::HASH, UserKeyTypes::BASIC, UserKeyTypes::OAUTH2],
            'message' => 'user_key.type_error'
        ])]
        public readonly string $type,

        /** @var array<string> */
        #[CustomAssert\TypeInfosConstraint]
        public readonly array $type_infos,

        #[Assert\Type(['type' => 'string', 'message' => 'user_key.user_agent_not_blank'])]
        public readonly ?string $user_agent,

        #[Assert\Type(['type' => 'string', 'message' => 'user_key.referer_not_blank'])]
        public readonly ?string $referer,

        #[Assert\Valid]
        public readonly ?IPListDTO $ip_list,
    ) {
    }
}