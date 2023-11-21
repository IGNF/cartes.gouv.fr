<?php

namespace App\Services;

use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CatalogsApiService;
use App\Services\EntrepotApi\CommunityApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\MetadataApi;
use App\Services\EntrepotApi\ProcessingApiService;
use App\Services\EntrepotApi\StaticApi;
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
        public readonly CatalogsApiService $catalogs,
        public readonly AnnexeApiService $annexe,
        public readonly CommunityApiService $community,
        public readonly MetadataApi $metadata,
        public readonly StaticApi $static,
    ) {
        $this->user->setEntrepotApiService($this);
        $this->datastore->setEntrepotApiService($this);
        $this->upload->setEntrepotApiService($this);
        $this->processing->setEntrepotApiService($this);
        $this->storedData->setEntrepotApiService($this);
        $this->configuration->setEntrepotApiService($this);
        $this->catalogs->setEntrepotApiService($this);
        $this->annexe->setEntrepotApiService($this);
        $this->community->setEntrepotApiService($this);
        $this->metadata->setEntrepotApiService($this);
        $this->static->setEntrepotApiService($this);
    }
}
