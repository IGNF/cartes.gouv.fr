<?php

namespace App\Dto\Services\Wfs;

use App\Dto\Services\CommonDTO;
use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;

#[Assert\Cascade]
class WfsServiceDTO extends CommonDTO
{
    /**
     * @var WfsTableDTO[]
     */
    #[Assert\Valid]
    #[Assert\Count(min: 1, minMessage: 'wfs_add.table.at_least_one')]
    #[SerializedName('table_infos')]
    public array $table_infos;
}
