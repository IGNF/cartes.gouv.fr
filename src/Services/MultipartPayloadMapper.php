<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Exception\ValidationFailedException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Lit un DTO depuis le champ JSON `data` d’une requête multipart (formulaires qui envoient aussi des fichiers).
 * Les erreurs de validation sortent en 422 au même format que #[MapRequestPayload] (voir CartesApiExceptionSubscriber).
 */
class MultipartPayloadMapper
{
    public function __construct(
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
    ) {
    }

    /**
     * @template T of object
     *
     * @param class-string<T> $dtoClass
     *
     * @return T
     */
    public function map(Request $request, string $dtoClass, string $field = 'data'): object
    {
        $json = $request->request->get($field);
        if (!is_string($json) || '' === $json) {
            throw new BadRequestHttpException(sprintf('Le champ "%s" est absent de la requête', $field));
        }

        try {
            $dto = $this->serializer->deserialize($json, $dtoClass, 'json');
        } catch (\Throwable $e) {
            throw new BadRequestHttpException(sprintf('Le champ "%s" est invalide : %s', $field, $e->getMessage()), $e);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            throw new UnprocessableEntityHttpException('Validation Failed', new ValidationFailedException($dto, $violations));
        }

        return $dto;
    }
}
