<?php

declare(strict_types=1);

namespace App\Constants\EntrepotApi;

// tags de lignée : livraison et traitements à l’origine d’une donnée stockée
final class StoredDataTags
{
    public const UPLOAD_ID = 'upload_id';
    public const PROC_INT_ID = 'proc_int_id';
    public const VECTORDB_ID = 'vectordb_id';
    public const PROC_PYR_CREAT_ID = 'proc_pyr_creat_id';
    public const IS_SAMPLE = 'is_sample';
}
