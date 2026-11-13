<?php

declare(strict_types=1);

namespace App\Services;

use App\Exception\AppException;
use App\Services\EntrepotApi\DatastoreApiService;
use Symfony\Component\HttpFoundation\Response;

/** Nouveaux noms : préfixe du datastore, casse comprise, suivi de « _ ». Les noms existants en « PREFIXE. » ne passent pas par ici. */
final readonly class DatastorePrefixValidator
{
    public function __construct(
        private DatastoreApiService $datastoreApiService,
    ) {
    }

    /**
     * @throws AppException 400 si l’identifiant ne commence pas par « PREFIXE_ »
     */
    public function assertFileIdentifier(string $datastoreId, string $fileIdentifier): void
    {
        $prefix = $this->datastoreApiService->get($datastoreId)['metadata_file_identifier_prefix'] ?? null;
        $this->assert($prefix, $fileIdentifier, 'file_identifier', 'L’identifiant de fichier');
    }

    /**
     * @throws AppException 400 si le nom technique ne commence pas par « PREFIXE_ »
     */
    public function assertLayerName(string $datastoreId, string $layerName): void
    {
        $prefix = $this->datastoreApiService->get($datastoreId)['configuration_layer_name_prefix'] ?? null;
        $this->assert($prefix, $layerName, 'technical_name', 'Le nom technique');
    }

    private function assert(mixed $prefix, string $value, string $field, string $label): void
    {
        if (!is_string($prefix) || '' === $prefix) {
            return;
        }

        if (!str_starts_with($value, $prefix.'_') || $value === $prefix.'_') {
            throw new AppException(sprintf('%s doit commencer par « %s_ »', $label, $prefix), Response::HTTP_BAD_REQUEST, ['field' => $field]);
        }
    }
}
