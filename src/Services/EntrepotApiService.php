<?php

namespace App\Services;

use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CommunityApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StoredDataApiService;
use App\Services\EntrepotApi\UploadApiService;
use App\Services\EntrepotApi\UserApiService;

class EntrepotApiService
{
    public function __construct(
        public readonly UserApiService $user,
        public readonly DatastoreApiService $datastore,
        public readonly UploadApiService $upload,
        public readonly ProcessingApiService $processing,
        public readonly StoredDataApiService $storedData,
        public readonly ConfigurationApiService $configuration,
        public readonly AnnexeApiService $annexe,
        public readonly CommunityApiService $community,
    ) {
        $this->user->setEntrepotApiService($this);
        $this->datastore->setEntrepotApiService($this);
        $this->upload->setEntrepotApiService($this);
        $this->processing->setEntrepotApiService($this);
        $this->storedData->setEntrepotApiService($this);
        $this->configuration->setEntrepotApiService($this);
        $this->annexe->setEntrepotApiService($this);
        $this->community->setEntrepotApiService($this);
    }
}
