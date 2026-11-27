<?php

declare(strict_types=1);

namespace App\Services;

use App\Services\EntrepotApi\DatastoreApiService;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Exception\ValidationFailedException;

/** Nouveaux noms : préfixe du datastore, casse comprise, suivi de « _ ». Les noms existants en « PREFIXE. » ne passent pas par ici. */
final readonly class DatastorePrefixValidator
{
    public function __construct(
        private DatastoreApiService $datastoreApiService,
    ) {
    }

    /**
     * @throws UnprocessableEntityHttpException 422 sur `file_identifier` si l’identifiant ne commence pas par « PREFIXE_ »
     */
    public function assertFileIdentifier(string $datastoreId, string $fileIdentifier): void
    {
        $prefix = $this->datastoreApiService->get($datastoreId)['metadata_file_identifier_prefix'] ?? null;
        $this->assert($prefix, $fileIdentifier, 'file_identifier', 'L’identifiant de fichier');
    }

    /**
     * @throws UnprocessableEntityHttpException 422 sur `technical_name` si le nom technique ne commence pas par « PREFIXE_ »
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
            // même format que les erreurs des DTO : le formulaire affiche le message sur le champ
            $violations = new ConstraintViolationList([new ConstraintViolation(sprintf('%s doit commencer par « %s_ »', $label, $prefix), null, [], $value, $field, $value)]);
            throw new UnprocessableEntityHttpException('Validation Failed', new ValidationFailedException($value, $violations));
        }
    }
}
