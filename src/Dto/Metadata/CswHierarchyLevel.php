<?php

namespace App\Dto\Metadata;

enum CswHierarchyLevel: string
{
    case Series = 'series';
    case Dataset = 'dataset';
}
