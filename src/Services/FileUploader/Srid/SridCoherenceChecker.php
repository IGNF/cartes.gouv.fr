<?php

namespace App\Services\FileUploader\Srid;

use App\Services\FileUploader\Exception\FileUploaderException;
use Symfony\Component\HttpFoundation\Response;

final class SridCoherenceChecker
{
    /**
     * @param string[] $srids
     */
    public function assertAndGetSingleSrid(array $srids): string
    {
        $normalized = array_values(array_filter($srids, static fn (string $srid): bool => '' !== trim($srid)));
        $unique = array_values(array_unique($normalized));

        if (!empty($unique) && 1 !== count($unique)) {
            throw new FileUploaderException('Ce fichier contient des données dans des systèmes de projection différents', Response::HTTP_BAD_REQUEST);
        }

        return (1 === count($unique)) ? $unique[0] : '';
    }
}
