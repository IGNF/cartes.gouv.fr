<?php

declare(strict_types=1);

namespace App\Dto\Metadata;

enum CswHierarchyLevel: string
{
    case Series = 'series';
    case Dataset = 'dataset';
}
