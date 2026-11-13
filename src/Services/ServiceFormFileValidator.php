<?php

declare(strict_types=1);

namespace App\Services;

use App\Services\EntrepotApi\ServiceImageAnnexeService;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Exception\ValidationFailedException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/** Fichiers envoyés avec le formulaire de publication d’un flux : 422 au chemin du champ, comme les erreurs du DTO. */
final readonly class ServiceFormFileValidator
{
    public function __construct(
        private ValidatorInterface $validator,
    ) {
    }

    /**
     * Images facultatives, validées ensemble.
     *
     * @return list<UploadedFile|null>
     */
    public function images(Request $request, string ...$fields): array
    {
        $files = [];
        $validator = $this->validator->startContext();
        foreach ($fields as $field) {
            $file = $request->files->get($field);
            $file = $file instanceof UploadedFile ? $file : null;
            $files[] = $file;
            if ($file instanceof UploadedFile) {
                // minWidth oblige à lire les dimensions : un fichier au bon type mais illisible est refusé
                $validator->atPath($field)->validate($file, new Assert\Image(
                    maxSize: ServiceImageAnnexeService::MAX_SIZE,
                    mimeTypes: ServiceImageAnnexeService::MIME_TYPES,
                    minWidth: 1,
                    maxSizeMessage: 'L’image ne peut pas dépasser {{ limit }} {{ suffix }}',
                    mimeTypesMessage: 'L’image doit être au format jpg ou png',
                    sizeNotDetectedMessage: 'L’image est illisible',
                ));
            }
        }

        $violations = $validator->getViolations();
        if (count($violations) > 0) {
            throw new UnprocessableEntityHttpException('Validation Failed', new ValidationFailedException($files, $violations));
        }

        return $files;
    }

    /**
     * Un fichier SLD obligatoire par table, sous `style_files[<table>]`. Le contenu n’est pas contrôlé : le formulaire le valide, l’Entrepôt le refuse s’il est invalide.
     *
     * @param string[] $tableNames
     *
     * @return array<string, UploadedFile> par nom de table
     */
    public function styleFiles(Request $request, array $tableNames): array
    {
        // PHP garde tels quels les espaces et les points d’un nom de table placé entre crochets
        $sent = $request->files->all('style_files');
        $files = [];
        $validator = $this->validator->startContext();
        foreach ($tableNames as $tableName) {
            $file = $sent[$tableName] ?? null;
            $file = $file instanceof UploadedFile ? $file : null;
            $validator->atPath(sprintf('style_files[%s]', $tableName))->validate($file, [
                new Assert\NotNull(message: 'Le fichier de style de la table est obligatoire'),
                // Symfony ne connaît pas l’extension sld ; finfo donne text/plain sans déclaration XML
                new Assert\File(
                    disallowEmptyMessage: 'Le fichier de style est vide',
                    extensions: ['sld' => ['text/xml', 'application/xml', 'text/plain']],
                    extensionsMessage: 'Le fichier de style doit être au format SLD',
                ),
            ]);
            if ($file instanceof UploadedFile) {
                $files[$tableName] = $file;
            }
        }

        $violations = $validator->getViolations();
        if (count($violations) > 0) {
            throw new UnprocessableEntityHttpException('Validation Failed', new ValidationFailedException($files, $violations));
        }

        return $files;
    }
}
