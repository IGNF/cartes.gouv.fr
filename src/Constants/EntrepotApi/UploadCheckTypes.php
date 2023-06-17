<?php

namespace App\Constants\EntrepotApi;

final class UploadCheckTypes
{
    public const ASKED = 'asked';
    public const IN_PROGRESS = 'in_progress';
    public const PASSED = 'passed';
    public const FAILED = 'failed';

    public const TYPES_LIST = [
        self::ASKED,
        self::IN_PROGRESS,
        self::PASSED,
        self::FAILED,
    ];
}
