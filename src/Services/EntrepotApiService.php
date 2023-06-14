<?php

namespace App\Services;

use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\UploadApiService;
use App\Services\EntrepotApi\UserApiService;

class EntrepotApiService
{
    public function __construct(
        public readonly UserApiService $user,
        public readonly DatastoreApiService $datastore,
        public readonly UploadApiService $upload
    ) {
        $this->user->setEntrepotApiService($this);
        $this->datastore->setEntrepotApiService($this);
        $this->upload->setEntrepotApiService($this);
    }
}
