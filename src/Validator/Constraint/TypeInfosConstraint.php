<?php

namespace App\Validator\Constraint;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Constraints\Compound;

#[\Attribute]
class TypeInfosConstraint extends Compound
{
    /**
     * @SuppressWarnings(UnusedFormalParameter)
     */
    protected function getConstraints(mixed $options = null): array
    {
        return [
            new Assert\Collection(
                fields: [
                    'login' => new Assert\Required([
                        new Assert\NotBlank([
                            'message' => 'user_key.login_not_blank',
                        ]),
                    ]),
                    'password' => new Assert\Optional([
                        new Assert\NotBlank([
                            'message' => 'user_key.password_not_blank',
                        ]),
                    ]),
                ]
            ),
        ];
    }
}
