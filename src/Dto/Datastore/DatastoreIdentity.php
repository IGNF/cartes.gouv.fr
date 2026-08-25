<?php

namespace App\Dto\Datastore;

final readonly class DatastoreIdentity
{
    public function __construct(
        public string $name,
        public string $technicalName,
        public string $communityId,
    ) {
    }
}
