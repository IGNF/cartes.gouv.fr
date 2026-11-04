<?php

namespace App\Dto\Services\Form;

use Symfony\Component\Validator\Constraints as Assert;

class WfsFormDTO extends ServiceFormDTO
{
    /** @var WfsTableFormDTO[] */
    #[Assert\Valid]
    #[Assert\Count(min: 1, minMessage: 'Veuillez choisir au moins une table')]
    public array $tables = [];
}
