<?php

namespace App\Serializer;

use App\Exception\AppException;
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\ErrorHandler\Exception\FlattenException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ProblemNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Corps d'erreur de l'API (RFC 9457) : `status`, `title`, `detail`, `details`, et `type` seulement quand le front branche dessus.
 *
 * @SuppressWarnings(UnusedFormalParameter) signature imposée par l'interface
 */
#[AsDecorator('serializer.normalizer.problem')]
final readonly class ApiErrorNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    // type par défaut de ProblemNormalizer, remplacé par l'absence de type (about:blank)
    private const SYMFONY_DEFAULT_TYPE = 'https://tools.ietf.org/html/rfc2616#section-10';

    public function __construct(
        private ProblemNormalizer $inner,
    ) {
    }

    // sans ce relais, le normaliseur décoré ne reçoit plus le sérialiseur et le 422 perd ses `violations`
    public function setSerializer(SerializerInterface $serializer): void
    {
        $this->inner->setSerializer($serializer);
    }

    /**
     * @param array<string, mixed> $context
     *
     * @return array<string, mixed>
     */
    public function normalize(mixed $object, ?string $format = null, array $context = []): array
    {
        /** @var FlattenException $object */
        $error = $this->inner->normalize($object, $format, $context);
        $exception = $context['exception'] ?? null;

        if (self::SYMFONY_DEFAULT_TYPE === $error['type']) {
            unset($error['type']);
        }
        $error['title'] = $object->getStatusText();

        if ($exception instanceof HttpExceptionInterface && '' !== $exception->getMessage()) {
            $error['detail'] = $exception->getMessage();
        }

        if ($exception instanceof AppException) {
            $error['details'] = $exception->getDetails();
            if (null !== $exception->getType()) {
                $error['type'] = $exception->getType();
            }
        }

        return $error;
    }

    /**
     * @param array<string, mixed> $context
     */
    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof FlattenException;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [FlattenException::class => true];
    }
}
