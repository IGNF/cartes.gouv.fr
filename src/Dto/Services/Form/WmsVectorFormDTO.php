<?php

namespace App\Dto\Services\Form;

use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;

class WmsVectorFormDTO extends ServiceFormDTO
{
    /** @var string[] */
    #[Assert\Count(min: 1, minMessage: 'Veuillez choisir au moins une table')]
    #[Assert\Unique]
    #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
    #[SerializedName('selected_tables')]
    public array $selected_tables = [];
}
