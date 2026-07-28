<?php

namespace App\Constants\EntrepotApi;

final class UploadTags
{
    public const INTEGRATION_CURRENT_STEP = 'integration_current_step';
    public const INTEGRATION_PROGRESS = 'integration_progress';

    public const INT_STEP_SEND_FILES_API = 'send_files_api';
    public const INT_STEP_WAIT_CHECKS = 'wait_checks';
    public const INT_STEP_PROCESSING = 'integration_processing';

    public const DATA_UPLOAD_PATH = 'data_upload_path';

    public const FILE_TREE = 'file_tree';

    // droits et accès déclarés au dépôt (câblage effectif des services : ticket à part)
    public const OPEN_DOWNLOAD = 'open_download';
    public const OPEN_EXTRACTION = 'open_extraction';
    public const EXTRACTION_PUBLIC = 'extraction_public';
}
