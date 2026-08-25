<?php

namespace App\Dto\Datastore;

/**
 * Identité d'un datastore telle que dérivée de l'appartenance de l'utilisateur (ou du DTO Entrepôt en secours).
 */
final readonly class DatastoreIdentity
{
    public function __construct(
        public string $name,
        public string $technicalName,
        public string $communityId,
    ) {
    }
}
