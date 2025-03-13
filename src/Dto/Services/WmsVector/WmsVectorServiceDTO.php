<?php

namespace App\Dto\Services\WmsVector;

use App\Dto\Services\CommonDTO;
use Symfony\Component\Serializer\Attribute\SerializedName;

class WmsVectorServiceDTO extends CommonDTO
{
    /** @var array<string> */
    #[SerializedName('selected_tables')]
    public array $selected_tables;
}
