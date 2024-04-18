<?php

namespace App\Entity\CswMetadata;

enum CswHierarchyLevel: string
{
    case Series = 'series';
    case Dataset = 'dataset';
}
