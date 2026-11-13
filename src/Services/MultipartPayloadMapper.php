<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Serializer\Exception\ExceptionInterface as SerializerException;
use Symfony\Component\Serializer\Exception\PartialDenormalizationException;
use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Exception\ValidationFailedException;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Lit un DTO depuis le champ JSON `data` d’une requête multipart (formulaires qui envoient aussi des fichiers).
 *
 * Comme #[MapRequestPayload] : un champ de type inattendu ou une contrainte non respectée donne un 422 avec la liste `violations`
 * (voir ApiErrorNormalizer) ; un champ `data` absent ou un JSON illisible donne un 400 au message fixe.
 */
class MultipartPayloadMapper
{
    public const INVALID_DATA_MESSAGE = 'Le champ « %s » est absent ou n’est pas un JSON valide.';

    public function __construct(
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
        private readonly TranslatorInterface $translator,
    ) {
    }

    /**
     * @template T of object
     *
     * @param class-string<T>   $dtoClass
     * @param list<string>|null $groups   groupes de validation, Default si null
     *
     * @return T
     *
     * @throws BadRequestHttpException          champ absent ou JSON illisible
     * @throws UnprocessableEntityHttpException erreurs de type ou de validation, avec une ValidationFailedException en `previous`
     */
    public function map(Request $request, string $dtoClass, string $field = 'data', ?array $groups = null): object
    {
        $json = $request->request->get($field);
        if (!is_string($json) || '' === $json) {
            throw new BadRequestHttpException(sprintf(self::INVALID_DATA_MESSAGE, $field));
        }

        $violations = new ConstraintViolationList();
        try {
            $dto = $this->serializer->deserialize($json, $dtoClass, 'json', [DenormalizerInterface::COLLECT_DENORMALIZATION_ERRORS => true]);
        } catch (PartialDenormalizationException $e) {
            // même conversion que RequestPayloadValueResolver
            foreach ($e->getErrors() as $error) {
                $template = 'This value was of an unexpected type.';
                $parameters = [];
                $expectedTypes = $error->getExpectedTypes();
                if (null !== $expectedTypes && [] !== $expectedTypes) {
                    $template = 'This value should be of type {{ type }}.';
                    $parameters['{{ type }}'] = implode('|', $expectedTypes);
                }
                $message = $this->translator->trans($template, $parameters, 'validators');
                $violations->add(new ConstraintViolation($message, $template, $parameters, null, $error->getPath(), null));
            }
            $dto = $e->getData();
        } catch (SerializerException $e) {
            throw new BadRequestHttpException(sprintf(self::INVALID_DATA_MESSAGE, $field), $e);
        }

        // objet partiel (propriétés non initialisées) : pas de validation, comme RequestPayloadValueResolver
        if (count($violations) > 0 || !$dto instanceof $dtoClass) {
            throw new UnprocessableEntityHttpException('Validation Failed', new ValidationFailedException($dto, $violations));
        }

        $violations = $this->validator->validate($dto, null, $groups);
        if (count($violations) > 0) {
            throw new UnprocessableEntityHttpException('Validation Failed', new ValidationFailedException($dto, $violations));
        }

        return $dto;
    }
}
