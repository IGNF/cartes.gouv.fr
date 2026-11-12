<?php

namespace App\Constants\EntrepotApi;

final class ZoomLevels
{
    public const TOP_LEVEL_DEFAULT = 0;
    public const BOTTOM_LEVEL_DEFAULT = 18;

    // bornes acceptées pour la génération des pyramides, les mêmes que `zoom_levels` de assets/data/ol-defaults.json
    public const MIN = 1;
    public const MAX = 18;
}
