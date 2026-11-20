<?php

declare(strict_types=1);

namespace App\Validator\Constraint;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Constraints\Compound;

/**
 * Fichier d’un document de fiche : 5 Mo au plus, type réel conforme à l’extension.
 */
final class DatasheetDocumentFile extends Compound
{
    /**
     * @param array<mixed> $options
     *
     * @return list<Assert\File>
     *
     * @SuppressWarnings("PHPMD.UnusedFormalParameter") signature imposée par Compound
     */
    protected function getConstraints(array $options): array
    {
        return [
            new Assert\File(
                maxSize: '5M',
                maxSizeMessage: 'Le fichier ne peut pas dépasser {{ limit }} {{ suffix }}',
                disallowEmptyMessage: 'Le fichier est vide',
                extensions: [
                    'qgz' => ['application/zip'],
                    'pdf' => ['application/pdf'],
                    'jpg' => ['image/jpeg'],
                    'jpeg' => ['image/jpeg'],
                    'png' => ['image/png'],
                    'svg' => ['image/svg+xml', 'image/svg'],
                    'csv' => ['text/csv', 'text/plain', 'application/csv'],
                ],
                extensionsMessage: 'Le fichier doit être au format qgz, pdf, jpg, png, svg ou csv',
            ),
        ];
    }
}
